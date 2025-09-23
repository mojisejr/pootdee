# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**pootdee** is a Next.js 14 application integrated with Sanity CMS and Clerk authentication. The project combines a modern React frontend with content management capabilities and user authentication.

## Repository : https://github.com/mojisejr/pootdee

## Evironment Variable [DON'T PUT THE REAL VALUE HERE]

NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
GOOGLE_AI_API_KEY
OPENAI_API_KEY
**Provided Environment Variables in `.env`, `.env.local` file**

## Resource References Path

** ALL IMPORTANT DOCUMENT THAT YOU NEED TO FIND WHEN WORKING WITH THIS REPOSITORY AND IMPLEMENTATION PLAN**

- `docs/theme-guide.md` : Color Theme Guide for the Application
- `docs/retrospective.md` : Retrospective of the Project
- `docs/retrospective/session-YYYY-MM-DD-[description].md` : Retrospective of the Project Session
- `docs/logs/YYYY-MM-DD-[type].log` : Log files for the Application
- `docs/backup-YYYY-MM-DD-HHMM.sql` : Backup files for the Application
- `docs/ai-guide.md` : AI Guide for the Application
- `docs/api-guide.md` : API Guide for the Application
- `docs/database-guide.md` : Database Guide for the Application
- `docs/error-guide.md` : Error Guide for the Application
- `docs/ui-guide.md` : UI Guide for the Application
- `docs/PRD.md` : Product Requirements Document for the Application
- `docs/plan.md` : Implementation Plan for the Application

## File Naming Conventions

- **Retrospective Files**: `/docs/retrospective/session-YYYY-MM-DD-[description].md`
- **Log Files**: `/docs/logs/YYYY-MM-DD-[type].log`
- **Backup Files**: `/docs/backup-YYYY-MM-DD-HHMM.sql`
- ** React Component Files**: `/src/app/components/ComponentName.tsx`

## Owner Description

- Solo Developer
- Intermediate Typescript and Javascript Skill
- Basic CICD Skill handle this with me carfully need your special help
- Basic DevOps Skill handle this with me carfully need your special help
- Basic Security Skill handle this with me carfully need your special help
  **IMPORTANT ! : All code must be easy to read and understand comment on what the code is doing and why on the Hard part** .
  **IMPORTANT ! : All code must be written in typescript and follow the My Coding Style** .

## My Coding Style

- **Don't use `any` type in typescript** (**REQUIRED**)
- **Always use Explicit Return types**
- **Prefer Functional Components over Class Components**
- **Reuse Components and Hooks when possible**
- **Interfaces and Type Must be in the `/interfaces` folder only**
- **All React Component Must be in the `/src/app/components` folder only**
- **All React Hook Must be in the `/src/app/hooks` folder only**
- **All Input and Output and Return types from every function and component must be defined NEVER use `any` type**

## Folder Structure That I prefer

- **`/src/components`**: React components used in the application this will organize components by feature or domain.
- **`/src/hooks`**: Custom React hooks used in the application this will organize hooks by feature or domain.
- **`/src/context`**: Global State Context Providers and Hooks this will organize context providers and hooks by feature or domain.
- **`/src/lib`**: Utility functions and helpers used throughout the application this will organize utility functions and helpers by feature or domain.
- **`/src/services/sanity`**: Database service files, including Sanity CMS client and database operations.
- **`/src/services/auth`**: Authentication service files, including Clerk authentication and user session management.
- **`/src/services/langchain`**: Langchain service files, including Langchain client and langchain operations.
- **`/src/interfaces`**: TypeScript interfaces used throughout the application this will organize interfaces by feature or domain.
- **`/src/app`** : Nextjs pages, layouts, api route go here.
- **`/docs/retrospective`**: Retrospective files, including session retrospectives and action items.
- **`/docs/logs`**: Log files, including application logs and error logs.
- **`/docs/backup`**: Backup files, including database backups and other important files.
- **`/docs/PRD.md`**: Product Requirements Document, outlining the project requirements and features.

## ⚠️ CRITICAL SAFETY RULES

### NEVER MERGE PRS YOURSELF

**DO NOT** use any commands to merge Pull Requests, such as `gh pr merge`. Your role is to create a well-documented PR and provide the link to the user.

**ONLY** provide the PR link to the user and **WAIT** for explicit user instruction to merge. The user will review and merge when ready.

### DO NOT DELETE CRITICAL FILES

You are **FORBIDDEN** from deleting or moving critical files and directories in the project. This includes, but is not limited to: `.env`, `.git/`, `node_modules/`, `package.json` and the main project root files. If a file or directory needs to be removed, you must explicitly ask for user permission and provide a clear explanation.

### HANDLE SENSITIVE DATA WITH CARE

You must **NEVER** include sensitive information such as API keys, passwords, or user data in any commit messages, Pull Request descriptions, or public logs. Always use environment variables for sensitive data. If you detect sensitive data, you must alert the user and **REFUSE** to proceed until the information is properly handled.

### STICK TO THE SCOPE

You are instructed to focus **ONLY** on the task described in the assigned Issue. Do not perform any refactoring, code cleanup, or new feature development unless it is explicitly part of the plan. If you encounter an opportunity to improve the code outside of the current scope, you must create a new task and discuss it with the user first.

### Start Simple (IMPORTANT !)

When implement new feature, and refactoring **starts simple with best practice approch** and then gradually move to complex if it's needed.

### CONFLICT PREVENTION & BRANCH SAFETY

**MANDATORY STAGING BRANCH SYNC**: Before any implementation (`=impl`), you **MUST** ensure the local staging branch is synchronized with remote origin. Use `git fetch origin && git checkout staging && git pull origin staging` to sync.

**STAGING-FIRST WORKFLOW**: All implementations work exclusively with staging branch. **NEVER** create PRs to main branch or interact with main branch during `=impl`. The user will handle main branch merges manually.

**FORCE PUSH RESTRICTIONS**: Only use `git push --force-with-lease` when absolutely necessary. **NEVER** use `git push --force` as it can overwrite team members' work. Always prefer clean rebasing and conflict resolution.

**EMERGENCY CONFLICT RESOLUTION**: If conflicts are detected during implementation:

1. **STOP** all operations immediately
2. **ALERT** the user about the conflict
3. **PROVIDE** clear resolution steps
4. **WAIT** for user approval before proceeding
5. **DOCUMENT** the resolution in commit messages

### AUTOMATED WORKFLOW SAFETY

**BRANCH NAMING ENFORCEMENT**: All feature branches **MUST** follow the pattern `feature/[issue-number]-[description]` (e.g., `feature/123-user-authentication`).

**COMMIT MESSAGE STANDARDS**: All commits **MUST** include:

- Clear, descriptive subject line (max 50 characters)
- Detailed body explaining the changes (if needed)
- Reference to related issue number
- Type prefix: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`

**PR CREATION REQUIREMENTS**: All Pull Requests **MUST** include:

- Comprehensive description of changes
- Link to related GitHub issue
- Testing instructions
- Breaking changes documentation (if any)
- Conflict resolution summary (if applicable)

---

## 🚀 Development Workflows

⚠️ CRITICAL: Synchronize Time Before Any File Operations

Before creating a new file or saving any timestamps, you MUST use the following command to retrieve the current date and time from the system:

date +"%Y-%m-%d %H:%M:%S"
This ensures accurate timestamp synchronization with the system clock and prevents time-related inconsistencies.

### Logging Strategy

**console.log will be 3 types **

- **INFO**: For general information messages that logged on both production and development environments eg. `INFO: User XYZ has successfully logged in.`
- **ERROR**: For error messages that logged on both production and development environments.
  eg. `ERROR: Failed to connect to database.`
- **DEBUG**: For debug messages that logged on development environments only.
  eg. `DEBUG: Database connection established.`

### The Two-Issue Pattern

This project uses a Two-Issue Pattern to separate work context from actionable plans, integrating local workflows with GitHub Issues for clarity and traceability.

- **Context Issues (`=fcs`):** Used to record the current state and context of a session on GitHub.

- **Task Issues (`=plan`):** Used to create a detailed and comprehensive plan of action on GitHub. The agent will use information from the latest Context Issue as a reference.

---

### Shortcut Commands

These commands are standard across all projects and streamline our communication with **AUTOMATED WORKFLOW INTEGRATION**.

### Shortcut Commands

... (ส่วนคำสั่งเดิมของคุณ)

- **`=update-kb`**: **CRITICAL KNOWLEDGE BASE UPDATE WORKFLOW** - Instructs the agent to update the project's **Shared Knowledge Base** file (`/docs/project_status.md` or `/docs/project_state.json`) with the latest architectural, UI, and functionality details. This command ensures persistent context and prevents a loss of project memory.
  1.  **Context Analysis**: Analyze the latest code changes, UI components, and system functionality.
  2.  **File Update**: Overwrite the existing knowledge base file with the new, comprehensive snapshot of the project's state.
  3.  **Synchronization**: Ensure the updated file is ready for all other agents and developers to read before any new implementation begins.
      **MANDATORY RULE**: This command **MUST** be executed after every successful implementation (`=impl`) to ensure the project's state is always synchronized.

- **`=fcs > [message]`**: Updates the `current-focus.md` file on the local machine and creates a **GitHub Context Issue** with the specified `[message]` as the title. **WARNING**: This command will only work if there are no open GitHub issues. If there are, the agent will alert you to clear the backlog before you can save a new context. To bypass this check, use the command `=fcs -f > [message]`.

- **`=plan > [question/problem]`**: Creates a **GitHub Task Issue** with a detailed and comprehensive plan of action. **STAGING-FIRST WORKFLOW & CONFLICT PREVENTION** - The agent will:
  1. **Pre-Planning Validation**:
     - **Auto-check**: Verify staging branch is up-to-date with remote
     - **Warning**: Alert if staging is behind remote origin
     - **Mandatory Sync**: Automatically sync staging before planning if needed
     - **PR Status Check**: Verify no conflicting open PRs exist
     - **Branch Status**: Check for existing feature branches and potential conflicts

  2. **Codebase Analysis Phase**: For non-new feature implementations (fixes, refactors, modifications):
     - Search and analyze all relevant code components and dependencies
     - Identify side effects and interconnected systems
     - Review existing patterns, conventions, and architectural decisions
     - Map data flow and component relationships
     - Assess impact on related functionality
     - **File Coordination Check**: Identify high-risk files requiring team coordination

  3. **Plan Creation Phase**: Use all gathered information including:
     - Current focus context from `current-focus.md`
     - Previous conversation history
     - Comprehensive codebase analysis results
     - Identified dependencies and side effects
     - **Staging Context Creation**: Include `staging-context.md` creation in implementation plan

  If an open Task Issue already exists, the agent will **update** that Issue with the latest information instead of creating a new one.

- **`=impl > [message]`**: **STAGING-FIRST IMPLEMENTATION WORKFLOW** - Instructs the agent to execute the plan contained in the latest **GitHub Task Issue** with full automation:
  1. **Pre-Implementation Validation**:
     - **MANDATORY**: Ensure currently on staging branch (`git checkout staging`)
     - **MANDATORY**: Sync staging with remote origin (`git pull origin staging`)
     - **MANDATORY**: Verify no existing open PRs that could conflict
     - **MANDATORY**: Ensure clean working directory before proceeding
     - **Conflict Detection**: Check for potential conflicts before starting
     - **Emergency Protocol**: Activate emergency resolution if conflicts detected

  2. **Auto-Branch Creation**: Creates feature branch from staging with proper naming (`feature/[issue-number]-[description]`)
  3. **Implementation**: Executes the planned work with continuous conflict monitoring
  4. **Enhanced Commit & Push Flow**:
     - **Pre-commit Validation**: Check for conflicts before each commit
     - **Descriptive Commits**: Atomic commits with clear, descriptive messages
     - **Safe Push Strategy**: Force push only when necessary with `--force-with-lease`
     - **Conflict Resolution**: Automatic conflict detection and resolution protocols

  5. **Staging Context Creation**: Creates `staging-context.md` with implementation details
  6. **Auto-PR Creation**: Creates Pull Request **TO STAGING BRANCH ONLY** with proper description and issue references
  7. **Issue Updates**: Updates the plan issue with PR link and completion status
  8. **User Notification**: Provides PR link for review and approval - **USER HANDLES MAIN BRANCH MERGES MANUALLY**

- **`=stage > [message]`**: **STAGING DEPLOYMENT WORKFLOW** - Deploys approved changes from feature branch to staging environment:
  1. **Pre-Staging Validation**:
     - **Feature Branch Validation**: Ensure feature branch is ready for staging
     - **Conflict Resolution**: Resolve any conflicts with staging branch
     - **Test Validation**: Run automated tests before staging deployment

  2. **Staging Deployment**:
     - **Merge to Staging**: Merge approved feature branch to staging
     - **Staging Context Update**: Update `staging-context.md` with deployment details
     - **Auto-Deploy**: Trigger staging environment deployment
     - **Health Check**: Verify staging deployment health

  3. **Staging Validation**:
     - **Functional Testing**: Run staging environment tests
     - **Performance Monitoring**: Monitor staging performance metrics
     - **User Acceptance**: Prepare for user acceptance testing

  4. **Production Readiness**:
     - **Production Context**: Create production deployment context
     - **Rollback Plan**: Prepare rollback procedures
     - **Notification**: Alert team of staging deployment completion

- **`=prod > [message]`**: **PRODUCTION DEPLOYMENT WORKFLOW** - Deploys validated changes from staging to production:
  1. **Pre-Production Validation**:
     - **Staging Validation**: Ensure staging tests pass completely
     - **Security Review**: Complete security audit checklist
     - **Performance Baseline**: Establish performance benchmarks

  2. **Production Deployment**:
     - **Merge to Main**: Merge staging branch to main/production
     - **Production Deploy**: Execute production deployment pipeline
     - **Health Monitoring**: Monitor production health metrics
     - **Performance Tracking**: Track production performance

  3. **Post-Deployment**:
     - **Cleanup Operations**: Auto-cleanup `staging-context.md`
     - **Monitoring Setup**: Establish production monitoring
     - **Documentation**: Update production documentation
     - **Team Notification**: Notify team of successful production deployment

  4. **Rollback Readiness**:
     - **Rollback Procedures**: Maintain rollback capabilities
     - **Incident Response**: Prepare incident response protocols

- **`=rrr > [message]`**: Creates a daily Retrospective file in the `docs/retrospective/` folder and creates a GitHub Issue containing a summary of the work, an AI Diary, and Honest Feedback, allowing you and the team to review the session accurately.

### 📋 Staging Context File Management

#### Auto-Cleanup Strategy for `staging-context.md`

**File Creation & Location**:

- **Created during**: `=impl` command execution
- **Location**: Project root directory (`./staging-context.md`)
- **Content**: Implementation details, deployment context, testing notes

**Lifecycle Management**:

- **Creation**: Automatically generated during feature implementation
- **Updates**: Modified during `=stage` deployment process
- **Cleanup**: Automatically removed during `=prod` deployment completion
- **Backup**: Context preserved in PR descriptions and commit messages

**File Management Benefits**:

- **Deployment Tracking**: Clear visibility of staging deployment status
- **Context Preservation**: Implementation details available during staging phase
- **Automatic Cleanup**: No manual file management required
- **Conflict Prevention**: Reduces repository clutter and merge conflicts

**Cleanup Triggers**:

- **Successful Production Deployment**: File automatically deleted after `=prod` completion
- **Failed Deployments**: File retained for debugging and rollback procedures
- **Manual Cleanup**: Available via `=prod --cleanup-only` command
- **Branch Cleanup**: Removed when feature branch is deleted

### 🔄 Plan Issue Management Guidelines

**CRITICAL**: For large, multi-phase projects, the agent must **UPDATE** existing plan issues instead of creating new ones.

- **When completing phases**: Update the plan issue to reflect completed phases and mark them as ✅ COMPLETED
- **Progress tracking**: Update the issue description with current status, next steps, and any blockers
- **Phase completion**: When a phase is finished, update the plan issue immediately before moving to the next phase
- **Never create new issues**: For ongoing multi-phase work, always update the existing plan issue (#20 for current system refactor)
- **Retrospective issues**: Only create retrospective issues for session summaries, not for plan updates

### 🎯 Enhanced Implementation Workflows

#### Branch Management Excellence

- **ALWAYS** create feature branches: `feature/[issue-number]-[description]`
- **NEVER** work directly on main branch
- **Workflow**: Analysis → Branch → Implementation → Build → Commit → PR → Updates

#### TodoWrite Integration Patterns

**High-Impact Usage**: Complex refactoring (3+ files), multi-phase implementations, large system changes
**Best Practices**: 5-8 specific todos, exactly ONE in_progress, complete immediately after finishing

### 🌿 Automated Workflow Implementation

**ENHANCED AUTOMATION**: All development workflows now include full automation to ensure consistent adherence to project guidelines.

#### Enhanced Command Behavior

The following commands now include **FULL WORKFLOW AUTOMATION**:

##### `=impl` Command Enhancement

**Automated Execution Flow:**

```
1. Parse GitHub Task Issue → Extract requirements and scope
2. Auto-Branch Creation → feature/[issue-number]-[sanitized-description]
3. Implementation Phase → Execute planned work with progress tracking
4. Auto-Commit & Push → Descriptive commits with proper formatting
5. Auto-PR Creation → Comprehensive PR with issue linking
6. Issue Updates → Update plan issue with PR link and completion status
7. User Notification → Provide PR URL for review and approval
```

##### TodoWrite Integration Enhancement

**Performance Impact from Retrospectives**: 56% faster implementations when TodoWrite is integrated

**Enhanced Implementation Flow with TodoWrite:**

```
1. Parse GitHub Task Issue → Extract requirements and scope
2. Initialize TodoWrite → Create 5-8 specific, actionable todos
3. Auto-Branch Creation → feature/[issue-number]-[sanitized-description]
4. Implementation Phase → Execute with real-time todo tracking
   ├─ Mark exactly ONE todo as 'in_progress' at a time
   ├─ Complete todos immediately after finishing each step
   ├─ Update progress visibility for stakeholders
   └─ Ensure accountability for all implementation steps
5. Auto-Commit & Push → Descriptive commits with proper formatting
6. Auto-PR Creation → Comprehensive PR with issue linking
7. Issue Updates → Update plan issue with PR link and completion status
8. TodoWrite Completion → Mark all todos as completed
9. User Notification → Provide PR URL for review and approval
```

**TodoWrite Performance Benefits:**

- **Visibility**: Real-time progress tracking for stakeholders
- **Accountability**: Prevents skipping critical implementation steps
- **Focus**: Reduces context switching during complex implementations
- **Efficiency**: Proven 15-minute implementations vs 34-minute baseline
- **Documentation**: Creates audit trail of implementation progress

**High-Impact TodoWrite Usage Patterns:**

```markdown
✅ Complex multi-component refactoring (3+ files)
✅ Full-stack implementations (API + Frontend)
✅ Multi-phase system changes (Database + Application)
✅ Pattern replication following proven approaches
✅ Large refactoring with dependency management

❌ Single file edits or trivial changes
❌ Simple documentation updates
❌ Quick bug fixes without multiple steps
```

##### Branch Naming Convention

- **Format**: `feature/[issue-number]-[sanitized-description]`
- **Source**: All feature branches **MUST** be created from `staging` branch
- **Flow**: `feature/[issue] → staging → main`
- **Example**: `feature/27-deployment-production-implementation`
- **Auto-sanitization**: Removes special characters, converts to kebab-case

##### Commit Message Standards

- **Format**: `[type]: [description] (#[issue-number])`
- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- **Example**: `feat: implement user authentication system (#25)`

##### Pull Request Automation

**Staging PRs** (Feature → Staging):

- **Title**: `[STAGING] [Feature Title] (#[issue-number])`
- **Description**: Implementation details, testing notes, staging deployment context
- **Context File**: References `staging-context.md` for deployment details
- **Issue Linking**: `Relates to #[issue-number]` (keeps issue open for production)

**Production PRs** (Staging → Main):

- **Title**: `[PRODUCTION] [Feature Title] (#[issue-number])`
- **Description**: Production deployment summary, staging validation results
- **Context File**: Includes staging validation and production readiness checklist
- **Issue Linking**: `Closes #[issue-number]` (closes issue after production deployment)

#### Workflow Safety Measures

**Enhanced Branch Protection**:

- **Main Branch**: Requires 2+ approvals, status checks, up-to-date branches
- **Staging Branch**: Requires 1+ approval, automated testing, conflict resolution
- **Feature Branches**: Standard protection, automated conflict detection

**Staging Sync Protocol**:

- **Pre-Implementation**: Always sync staging with main before creating feature branches
- **Pre-Staging**: Ensure feature branch is up-to-date with staging before PR
- **Pre-Production**: Validate staging branch is ready for main merge

**Conflict Prevention**:

- **Staging-First Rule**: All features go through staging before production
- **Sync Validation**: Automated checks for branch synchronization
- **Emergency Protocol**: Immediate conflict resolution for critical deployments

**CRITICAL RULES**:

- **NEVER** work directly on main/staging branches
- **ALWAYS** create feature branches from staging
- **ALWAYS** deploy to staging before production
- **ALWAYS** validate staging deployment before main PR

### Implementation Guidelines for Automated Workflow

#### Pre-Implementation Checks

- ✅ Verify GitHub Task Issue exists and is properly formatted
- ✅ Ensure no conflicting branches exist
- ✅ Confirm GitHub CLI is authenticated and functional
- ✅ Validate repository permissions for branch creation and PR management

#### Error Handling and Fallbacks

- **Branch Creation Failure**: Falls back to manual branch creation with user guidance
- **Push Failure**: Provides manual push commands and troubleshooting steps
- **PR Creation Failure**: Falls back to manual PR creation with pre-filled templates
- **Issue Update Failure**: Logs error and provides manual update instructions

#### Quality Assurance

**Staging PR Requirements**:

- **Reviewers**: Minimum 1 reviewer approval required
- **Automated Checks**: Build validation, type checking, linting
- **Context File**: Must reference `staging-context.md` with deployment details
- **Testing**: Feature testing in staging environment

#### Monitoring and Feedback

- **Progress Tracking**: Real-time updates during implementation phases
- **Success Metrics**: PR creation success rate and review completion time
- **User Feedback**: Continuous improvement based on workflow effectiveness
- **Audit Trail**: Complete history of automated actions for debugging

---

## Commands

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Type Checking

```bash
# TypeScript type checking
npx tsc --noEmit
```

### Sanity CMS

```bash
# Access Sanity Studio at /studio route
# Studio is configured at /app/studio/[[...tool]]/page.tsx
```

## Architecture & Tech Stack

### Framework & Core Technologies

- **Next.js 14** (App Router) with TypeScript
- **React 18** with strict mode
- **Sanity CMS** for content management
- **Clerk** for authentication and user management
- **Styled Components** for styling
- **Tailwind CSS** for utility-first styling

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with Clerk provider
│   ├── page.tsx           # Home page
│   └── studio/            # Sanity Studio pages
├── middleware.ts          # Clerk middleware configuration
└── sanity/                # Sanity CMS configuration
    ├── env.ts            # Environment variables
    ├── lib/              # Sanity client and utilities
    ├── schemaTypes/      # Content schemas
    └── structure.ts      # Studio structure
```

### Key Configuration Files

- `sanity.config.ts` - Sanity Studio configuration
- `sanity.cli.ts` - Sanity CLI configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript path mapping with `@/*` alias

### Authentication Flow

- **Clerk Provider**: Wraps entire application in `app/layout.tsx`
- **Middleware**: Handles authentication routes via `src/middleware.ts`
- **UI Components**: SignIn/SignUp buttons and UserButton in header

### Content Management

- **Sanity Studio**: Accessible at `/studio` route
- **API Version**: Uses date-based versioning (2025-09-21)
- **Environment Variables Required**:
  - `NEXT_PUBLIC_SANITY_PROJECT_ID`
  - `NEXT_PUBLIC_SANITY_DATASET`
  - `NEXT_PUBLIC_SANITY_API_VERSION` (optional, defaults to 2025-09-21)

### Styling Architecture

- **Hybrid Approach**: Combines Tailwind CSS utilities with Styled Components
- **Typography**: Uses Inter font via Google Fonts
- **Responsive Design**: Mobile-first with Tailwind breakpoints
- **Theme Support**: Dark mode classes available

## Development Guidelines

### Environment Setup

1. Copy `.env.local.example` to `.env.local` (if available)
2. Configure required environment variables for Sanity and Clerk
3. Run `npm install` to install dependencies
4. Start development server with `npm run dev`

### Code Conventions

- **File Organization**: Follow Next.js App Router conventions
- **TypeScript**: Strict mode enabled, use proper typing
- **Styling**: Prefer Tailwind utilities, use Styled Components for complex components
- **Import Paths**: Use `@/` alias for src directory imports

### Content Management Workflow

- Access Sanity Studio at `http://localhost:3000/studio`
- Define content schemas in `src/sanity/schemaTypes/`
- Configure Studio structure in `src/sanity/structure.ts`
- Use Sanity client from `src/sanity/lib/client.ts` for data fetching

### Authentication Integration

- Clerk handles all authentication flows
- Wrap authenticated content with `<SignedIn>` component
- Use `<SignedOut>` for unauthenticated states
- Access user data via Clerk hooks in client components
