# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. It uses Claude AI to generate React components based on user descriptions and displays them in a live preview using a virtual file system.

## Development Commands

```bash
# Initial setup (install deps, generate Prisma client, run migrations)
npm run setup

# Start development server with Turbo pack
npm run dev

# Run tests with Vitest
npm run test

# Run linter
npm run lint

# Build for production
npm run build

# Reset database (force reset all data)
npm run db:reset
```

## Tech Stack

- **Next.js 15** with App Router and Turbo pack
- **React 19** with TypeScript
- **Tailwind CSS v4** for styling
- **Prisma** with SQLite database
- **Anthropic Claude AI** via Vercel AI SDK
- **Vitest** for testing
- **Babel Standalone** for JSX transformation in browser

## Code Style Guidelines

- Use comments sparingly. Only comment complex code.

## Architecture

### Virtual File System

The core of the application is a virtual file system (`VirtualFileSystem` class in `src/lib/file-system.ts`) that stores all generated files in memory. No files are written to the actual disk during component generation.

- **Location**: `src/lib/file-system.ts`
- **Purpose**: Manages an in-memory file tree with support for CRUD operations
- **Serialization**: Files are serialized to JSON and stored in the database for persistence
- **Key Methods**: `createFile`, `updateFile`, `deleteFile`, `rename`, `readFile`, `getAllFiles`, `serialize`, `deserialize`

### AI Provider System

The application uses Claude AI for component generation but includes a fallback mock provider when no API key is configured.

- **Location**: `src/lib/provider.ts`
- **Real Provider**: Uses `@ai-sdk/anthropic` with `claude-haiku-4-5` model
- **Mock Provider**: `MockLanguageModel` class that returns static counter/form/card components
- **Selection**: Automatically uses mock if `ANTHROPIC_API_KEY` is not set in `.env`

### AI Tools

The AI has access to two tools for file manipulation:

1. **str_replace_editor** (`src/lib/tools/str-replace.ts`)
   - Commands: `view`, `create`, `str_replace`, `insert`, `undo_edit`
   - Primary tool for creating and editing files
   - Used by AI to build component files

2. **file_manager** (`src/lib/tools/file-manager.ts`)
   - Commands: `rename`, `delete`
   - Used for file operations beyond editing

### Preview System

The preview system transforms user-generated JSX/TSX files into runnable code in the browser:

1. **Transformation** (`src/lib/transform/jsx-transformer.ts`):
   - Uses Babel to transform JSX/TSX to plain JavaScript
   - Creates blob URLs for each transformed file
   - Generates an import map with `@/` alias support
   - Handles third-party packages via esm.sh CDN

2. **Preview HTML Generation**:
   - Creates a full HTML document with import maps
   - Includes Tailwind CSS via CDN
   - Uses React 19 from esm.sh
   - Shows syntax errors with formatted error display

3. **PreviewFrame Component** (`src/components/preview/PreviewFrame.tsx`):
   - Renders generated HTML in an iframe
   - Updates automatically when files change

### Database Schema

The database schema is defined in `prisma/schema.prisma`. Reference it anytime you need to understand the structure of data stored in the database.

**User Model**:
- `id`, `email`, `password`, `createdAt`, `updatedAt`
- One-to-many relationship with Projects

**Project Model**:
- `id`, `name`, `userId`, `messages`, `data`, `createdAt`, `updatedAt`
- `messages`: JSON string of chat conversation
- `data`: JSON serialized virtual file system state
- Belongs to User (optional for anonymous projects)

### Authentication

- Uses JWT tokens with `jose` library
- Session stored in HTTP-only cookies
- Auth actions in `src/lib/auth.ts`
- Middleware in `src/middleware.ts` for protected routes
- Anonymous users can create temporary projects

### API Routes

**POST /api/chat/route.ts**:
- Main chat endpoint for component generation
- Accepts: `messages`, `files` (serialized VFS), `projectId`
- Returns: Streaming response using Vercel AI SDK
- On finish: Saves updated messages and files to database for authenticated users

### Contexts

1. **FileSystemContext** (`src/lib/contexts/file-system-context.tsx`)
   - Manages virtual file system state
   - Provides file CRUD operations to components
   - Syncs with backend via chat API

2. **ChatContext** (`src/lib/contexts/chat-context.tsx`)
   - Manages chat messages and streaming state
   - Handles AI responses and tool calls

### Component Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home/landing page
│   ├── [projectId]/       # Project editor page
│   └── api/chat/          # Chat API endpoint
├── components/
│   ├── chat/              # Chat interface components
│   ├── editor/            # Code editor and file tree
│   ├── preview/           # Preview frame component
│   ├── auth/              # Sign up/sign in forms
│   └── ui/                # Reusable UI components (shadcn/ui)
├── lib/
│   ├── file-system.ts     # Virtual file system core
│   ├── provider.ts        # AI provider (real + mock)
│   ├── tools/             # AI tools for file manipulation
│   ├── transform/         # JSX transformation for preview
│   ├── contexts/          # React contexts
│   ├── prompts/           # System prompts for AI
│   └── auth.ts            # Authentication utilities
├── actions/               # Server actions for projects
└── hooks/                 # Custom React hooks
```

## Key Implementation Details

### Import Alias System

All generated components use `@/` as an import alias pointing to the virtual file system root:
- Example: `import Counter from '@/components/Counter'`
- The preview system resolves these using import maps
- Babel transformation maintains these aliases

### Component Generation Flow

1. User sends message via chat interface
2. Message + current file system state sent to `/api/chat`
3. AI receives system prompt from `src/lib/prompts/generation.tsx`
4. AI uses `str_replace_editor` tool to create/modify files
5. Updated files streamed back to client
6. Preview automatically updates via JSX transformation
7. If authenticated, messages and files saved to database

### Testing

- Tests use Vitest with jsdom environment
- Component tests in `__tests__` directories alongside components
- Test configuration in `vitest.config.mts`
- Run single test file: `npm test -- <file-path>`

## Important Notes

- Every project must have a root `/App.jsx` file as the entry point
- Use Tailwind CSS classes, not inline styles
- Do not create HTML files; App.jsx is the entry point
- All file paths in the virtual FS start with `/`
- The mock provider generates counter/form/card components when no API key is present
- Preview uses Tailwind CSS v4 via CDN for styling

## Custom Commands

### /audit

**Purpose:** Update vulnerable dependencies in the project.

**Steps to execute:**
1. Run `npm audit` to identify vulnerable packages installed in the project
2. Display the audit results to the user, showing vulnerabilities found
3. Run `npm audit fix` to automatically apply updates to vulnerable packages
4. Run `npm test` to verify the updates did not break anything
5. Report the results:
   - Number of vulnerabilities fixed
   - Test results (pass/fail)
   - Any remaining vulnerabilities that require manual intervention
6. If tests fail after updates, inform the user and suggest rolling back or investigating the failures
