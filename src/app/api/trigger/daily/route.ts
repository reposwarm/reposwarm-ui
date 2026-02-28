import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { temporalClient } from '@/lib/temporal'
import { dynamoService } from '@/lib/dynamodb'
import { CodeCommitClient, ListRepositoriesCommand, GetRepositoryCommand } from '@aws-sdk/client-codecommit'

const AWS_REGION = process.env.AWS_REGION || 'us-east-1'

async function autoDiscoverRepos(): Promise<string[]> {
  const codecommit = new CodeCommitClient({ region: AWS_REGION })
  const discovered: string[] = []
  let nextToken: string | undefined

  do {
    const response = await codecommit.send(new ListRepositoriesCommand({
      nextToken,
      sortBy: 'repositoryName',
      order: 'ascending'
    }))

    for (const repo of response.repositories || []) {
      if (!repo.repositoryName) continue
      discovered.push(repo.repositoryName)

      // Also add to DynamoDB so they persist
      try {
        const existing = await dynamoService.getRepo(repo.repositoryName)
        if (!existing) {
          const detail = await codecommit.send(new GetRepositoryCommand({
            repositoryName: repo.repositoryName
          }))
          await dynamoService.addRepo({
            name: repo.repositoryName,
            url: detail.repositoryMetadata?.cloneUrlHttp || `codecommit://${repo.repositoryName}`,
            source: 'CodeCommit',
            lastCommit: detail.repositoryMetadata?.lastModifiedDate?.toISOString(),
            enabled: true,
            status: 'active'
          })
        }
      } catch (err) {
        logger.warn('Failed to persist discovered repo:', { repo: repo.repositoryName, error: String(err) })
      }
    }

    nextToken = response.nextToken
  } while (nextToken)

  return discovered
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { repos, model, chunkSize, parallelLimit } = body

    let repoList = repos
    if (!repoList || repoList.length === 0) {
      // Get all enabled repos from DynamoDB
      const allRepos = await dynamoService.listRepos()
      repoList = allRepos
        .filter(r => r.enabled)
        .map(r => r.name)

      // If still empty, auto-discover from CodeCommit
      if (repoList.length === 0) {
        logger.info('No repos in DB, auto-discovering from CodeCommit...')
        repoList = await autoDiscoverRepos()
        logger.info(`Auto-discovered ${repoList.length} repos`)
      }
    }

    if (repoList.length === 0) {
      return NextResponse.json(
        { error: 'No repositories found. Check IAM permissions for CodeCommit access.' },
        { status: 400 }
      )
    }

    const workflowId = `investigate-daily-${Date.now()}`

    const result = await temporalClient.startWorkflow(
      workflowId,
      'InvestigateReposWorkflow',
      {
        repos: repoList,
        model: model || 'us.anthropic.claude-sonnet-4-6',
        chunkSize: chunkSize || 10,
        parallelLimit: parallelLimit || 3
      }
    )

    return NextResponse.json({
      success: true,
      workflowId: result.workflowId,
      runId: result.runId,
      repoCount: repoList.length,
      autoDiscovered: !repos || repos.length === 0
    })
  } catch (error) {
    logger.error('Error triggering daily investigation:', { error: String(error) })
    return NextResponse.json(
      { error: 'Failed to trigger daily investigation' },
      { status: 500 }
    )
  }
}
