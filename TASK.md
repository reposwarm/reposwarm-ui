# RepoSwarm UI - Task Specification

## Overview
Build a Next.js + React + TypeScript dashboard for RepoSwarm — the AI-powered multi-repo architecture discovery platform. This UI shows workflow status, run history, and allows triggering investigations.

## Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **State:** React Query (TanStack Query) for server state
- **Charts:** Recharts (for run metrics/timelines)
- **Icons:** Lucide React

## Architecture
The UI talks to two backends:
1. **Temporal Server HTTP API** (port 8233) — workflow status, run history, namespace info
2. **RepoSwarm API** (new — build a small Next.js API route layer) — triggers, config, repo list

### API Routes (Next.js `/app/api/`)
All API routes proxy to the internal Temporal server or DynamoDB:

| Route | Method | Description |
|-------|--------|-------------|
| `/api/workflows` | GET | List all workflow executions (paginated) |
| `/api/workflows/[id]` | GET | Get single workflow details + history |
| `/api/workflows/[id]/terminate` | POST | Terminate a running workflow |
| `/api/trigger/single` | POST | Trigger investigation on a single repo |
| `/api/trigger/daily` | POST | Trigger the full daily investigation cycle |
| `/api/repos` | GET | List all configured repos (from DynamoDB cache table) |
| `/api/repos` | POST | Add/update a repo in the investigation list |
| `/api/repos/[name]` | DELETE | Remove a repo from investigation list |
| `/api/health` | GET | Health check (Temporal connectivity + self) |
| `/api/config` | GET | Get current RepoSwarm config (models, chunk size, etc.) |

### Environment Variables
```
TEMPORAL_SERVER_URL=http://temporal-alb-internal:8233  # Temporal HTTP API
TEMPORAL_NAMESPACE=default
TEMPORAL_TASK_QUEUE=investigate-task-queue
AWS_REGION=us-east-1
DYNAMODB_CACHE_TABLE=reposwarm-cache
CODECOMMIT_ENABLED=true
```

## Pages

### 1. Dashboard (`/`)
- **Summary cards:** Total repos, Active runs, Completed today, Failed today
- **Recent activity timeline:** Last 10 workflow events with status badges
- **Quick actions:** "Run Daily Investigation" button, "Investigate Single Repo" dropdown
- **System health:** Temporal connection status, Worker status

### 2. Workflows (`/workflows`)
- **Filterable table** of all workflow executions
  - Columns: Workflow ID, Type (single/multi), Status, Start Time, Duration, Repo Count
  - Status badges: Running (blue pulse), Completed (green), Failed (red), Terminated (gray)
  - Click row → workflow detail page
- **Filters:** Status, Type, Date range
- **Pagination** with 25 per page

### 3. Workflow Detail (`/workflows/[id]`)
- **Header:** Workflow ID, type, status, timing
- **Event history:** Timeline of activities (repo clone, analysis, commit, etc.)
- **Input/Output:** JSON view of workflow input params and results
- **Actions:** Terminate (if running), Re-run
- **Child workflows:** If parent (InvestigateReposWorkflow), show child workflow links

### 4. Repositories (`/repos`)
- **Grid/Table** of all tracked repositories
  - Name, Source (GitHub/CodeCommit), Last analyzed, Last commit, Status
  - Toggle: Enable/Disable individual repos
- **Add repo form:** URL + source type
- **Bulk actions:** Investigate selected, Remove selected
- **Search/filter**

### 5. Triggers (`/triggers`)
- **Daily schedule:** Show current schedule (every 6h), next run time
- **Manual trigger panel:**
  - Single repo: dropdown + "Investigate" button
  - Full daily: "Run All" button with confirmation modal
  - Custom: Select multiple repos + chunk size + model override
- **Trigger history:** Last 20 manual triggers with who/when/what

### 6. Settings (`/settings`)
- **Model config:** Current Claude model, token limits (read-only display)
- **Workflow config:** Chunk size, sleep duration, parallel limit
- **Architecture Hub:** Link to arch-hub repo, last push time
- **Worker info:** Connected workers, task queue depth

## UI Components
- `StatusBadge` — workflow status with color + animation
- `RepoCard` — repo info card with last analysis summary
- `TimelineEvent` — activity event in workflow timeline
- `TriggerModal` — confirmation dialog for triggers
- `DataTable` — reusable sortable/filterable table
- `StatsCard` — dashboard summary metric card
- `JsonViewer` — collapsible JSON display

## Design
- Dark theme (slate/zinc palette — matches AWS console vibe)
- Responsive (works on tablet+)
- Loading skeletons for async data
- Toast notifications for trigger actions
- Auto-refresh every 30s on dashboard and workflow list

## Docker
Build a multi-stage Dockerfile:
```dockerfile
FROM node:22-alpine AS builder
# ... build Next.js
FROM node:22-alpine AS runner
# ... production runtime
```
ARM64 compatible (node:22-alpine supports arm64).

## File Structure
```
reposwarm-ui/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx (dashboard)
│   │   ├── workflows/
│   │   │   ├── page.tsx (list)
│   │   │   └── [id]/page.tsx (detail)
│   │   ├── repos/page.tsx
│   │   ├── triggers/page.tsx
│   │   ├── settings/page.tsx
│   │   └── api/
│   │       ├── workflows/route.ts
│   │       ├── workflows/[id]/route.ts
│   │       ├── trigger/single/route.ts
│   │       ├── trigger/daily/route.ts
│   │       ├── repos/route.ts
│   │       ├── health/route.ts
│   │       └── config/route.ts
│   ├── components/
│   │   ├── ui/ (reusable primitives)
│   │   ├── StatusBadge.tsx
│   │   ├── RepoCard.tsx
│   │   ├── DataTable.tsx
│   │   ├── StatsCard.tsx
│   │   ├── TimelineEvent.tsx
│   │   ├── TriggerModal.tsx
│   │   ├── JsonViewer.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── lib/
│   │   ├── temporal.ts (Temporal HTTP API client)
│   │   ├── dynamodb.ts (DynamoDB operations)
│   │   └── types.ts (shared TypeScript types)
│   └── hooks/
│       ├── useWorkflows.ts
│       ├── useRepos.ts
│       └── useTrigger.ts
├── public/
├── Dockerfile
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Important Notes
- No Cognito auth for now (internal ALB only, behind CloudFront later)
- Temporal HTTP API is REST-like (not gRPC) — use standard fetch
- DynamoDB access via AWS SDK v3 (`@aws-sdk/client-dynamodb` + `@aws-sdk/lib-dynamodb`)
- The `trigger/single` API route should use Temporal SDK to start a `InvestigateSingleRepoWorkflow`
- The `trigger/daily` API route should start `InvestigateReposWorkflow`
- For Temporal workflow start, use the REST API: `POST /api/v1/namespaces/{namespace}/workflows`
- Include proper error handling + loading states everywhere
- Build fully functional — not stubs. Real API calls, real data fetching.
