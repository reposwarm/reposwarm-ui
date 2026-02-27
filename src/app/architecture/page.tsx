'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Server, Database, GitBranch, Brain, Shield, DollarSign, Cpu, HardDrive, Network, Cloud } from 'lucide-react'

export default function ArchitecturePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Architecture</h1>
        <p className="text-muted-foreground mt-2">
          RepoSwarm is an AI-powered multi-repository architecture discovery platform that orchestrates intelligent analysis across your entire codebase.
        </p>
      </div>

      {/* Architecture Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>System Components</CardTitle>
          <CardDescription>High-level architecture of the RepoSwarm platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Orchestration Layer */}
            <div className="col-span-full">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Network className="mr-2 h-5 w-5" />
                Orchestration Layer
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ComponentCard
                  icon={<Server className="h-5 w-5" />}
                  title="Temporal Server"
                  description="Workflow orchestration engine managing distributed analysis tasks with fault tolerance and retry logic"
                  tech="AWS ECS Fargate"
                />
                <ComponentCard
                  icon={<Cpu className="h-5 w-5" />}
                  title="RepoSwarm Worker"
                  description="Distributed worker nodes executing repository analysis workflows and coordinating AI agents"
                  tech="Auto-scaling EC2 Spot Instances"
                />
              </div>
            </div>

            {/* Data Layer */}
            <div className="col-span-full">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Data Layer
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <ComponentCard
                  icon={<Database className="h-5 w-5" />}
                  title="Aurora PostgreSQL"
                  description="Primary data store for workflow state, repository metadata, and analysis results"
                  tech="Serverless v2"
                />
                <ComponentCard
                  icon={<HardDrive className="h-5 w-5" />}
                  title="DynamoDB Cache"
                  description="High-performance cache for frequently accessed data and real-time status updates"
                  tech="On-demand pricing"
                />
                <ComponentCard
                  icon={<GitBranch className="h-5 w-5" />}
                  title="CodeCommit Repos"
                  description="Secure Git repository hosting for analyzed codebases with fine-grained access control"
                  tech="AWS CodeCommit"
                />
              </div>
            </div>

            {/* Intelligence Layer */}
            <div className="col-span-full">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Brain className="mr-2 h-5 w-5" />
                Intelligence Layer
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ComponentCard
                  icon={<Brain className="h-5 w-5" />}
                  title="Bedrock Claude"
                  description="Advanced LLM for code understanding, architecture analysis, and intelligent recommendations"
                  tech="Claude 3 Sonnet via AWS Bedrock"
                />
                <ComponentCard
                  icon={<Cloud className="h-5 w-5" />}
                  title="Architecture Hub"
                  description="Centralized knowledge base storing architectural patterns, best practices, and analysis templates"
                  tech="S3 + CloudFront"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Design Decisions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Design Decisions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <DecisionItem
              title="Temporal for Orchestration"
              description="Chosen for its robust workflow orchestration capabilities, built-in retry mechanisms, and ability to handle long-running processes. Temporal ensures reliability in distributed analysis tasks."
            />
            <DecisionItem
              title="Serverless Aurora PostgreSQL"
              description="Provides automatic scaling, high availability, and cost efficiency for variable workloads. Scales down to zero during inactive periods."
            />
            <DecisionItem
              title="DynamoDB for Caching"
              description="Millisecond latency for status updates and frequently accessed data. Pay-per-request pricing model aligns with sporadic analysis patterns."
            />
            <DecisionItem
              title="AWS Bedrock for AI"
              description="Managed service eliminates infrastructure overhead. Claude 3 Sonnet provides excellent code understanding capabilities with predictable pricing."
            />
            <DecisionItem
              title="EC2 Spot Instances for Workers"
              description="70-90% cost savings for non-critical analysis workloads. Temporal handles interruptions gracefully with automatic task redistribution."
            />
            <DecisionItem
              title="CodeCommit Integration"
              description="Native AWS integration with IAM for security. Eliminates need for external Git hosting and provides audit trails."
            />
          </div>
        </CardContent>
      </Card>

      {/* Cost Estimate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="mr-2 h-5 w-5" />
            Cost Estimate
          </CardTitle>
          <CardDescription>Estimated monthly costs for a typical deployment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <CostItem service="Temporal Server (ECS Fargate)" cost="$8" description="1 vCPU, 2GB RAM, always-on" />
            <CostItem service="Aurora PostgreSQL Serverless" cost="$5" description="0.5 ACU minimum, scales to 1 ACU" />
            <CostItem service="DynamoDB" cost="$2" description="On-demand, ~100K requests/month" />
            <CostItem service="EC2 Spot Instances (Workers)" cost="$6" description="t4g.medium, ~50 hours/month" />
            <CostItem service="AWS Bedrock (Claude 3 Sonnet)" cost="$3" description="~10K tokens per analysis" />
            <CostItem service="CodeCommit" cost="$1" description="5 active users, unlimited repos" />
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center font-semibold">
                <span>Total Estimated Monthly Cost</span>
                <span className="text-xl">~$25/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                * Costs may vary based on usage patterns and AWS region. Estimate assumes moderate usage with 10-20 repository analyses per month.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Architecture Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Key Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BenefitItem
              title="Scalability"
              description="Automatically scales from analyzing single repositories to entire organizations with hundreds of repos"
            />
            <BenefitItem
              title="Reliability"
              description="Temporal ensures workflows complete even with failures. Built-in retry logic and error handling"
            />
            <BenefitItem
              title="Cost Efficiency"
              description="Serverless and spot instance usage minimizes costs. Pay only for actual usage"
            />
            <BenefitItem
              title="Security"
              description="All data stays within AWS. IAM integration provides fine-grained access control"
            />
            <BenefitItem
              title="Observability"
              description="Built-in monitoring through Temporal UI and CloudWatch. Full audit trail of all operations"
            />
            <BenefitItem
              title="Extensibility"
              description="Modular architecture allows easy addition of new analysis types and AI models"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ComponentCard({ icon, title, description, tech }: {
  icon: React.ReactNode
  title: string
  description: string
  tech: string
}) {
  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-start space-x-3">
        <div className="text-primary mt-1">{icon}</div>
        <div className="flex-1">
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md inline-block mt-2">
            {tech}
          </span>
        </div>
      </div>
    </div>
  )
}

function DecisionItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start space-x-3">
      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
      <div className="flex-1">
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  )
}

function CostItem({ service, cost, description }: { service: string; cost: string; description: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="font-medium">{service}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
      <div className="text-lg font-semibold">{cost}</div>
    </div>
  )
}

function BenefitItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start space-x-3">
      <div className="text-green-500 mt-1">✓</div>
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  )
}