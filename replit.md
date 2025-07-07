# AI Chat Application

## Overview

This is a modern full-stack AI chat application built with React frontend and Express backend. The application allows users to have conversations with an AI assistant powered by OpenAI's GPT-4o model. It features a clean, responsive interface using shadcn/ui components and TailwindCSS for styling.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: TailwindCSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API structure
- **Development**: Hot reload with tsx in development mode
- **Production**: Compiled with esbuild for optimal performance

## Key Components

### Database & Storage
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Current Storage**: In-memory storage implementation (MemStorage)
- **Schema**: Defined in shared/schema.ts with users and messages tables
- **Migration**: Drizzle Kit for database migrations

### Authentication & Authorization
- Currently not implemented but database schema includes users table for future implementation

### AI Integration
- **Provider**: OpenAI API with GPT-4o model
- **Service**: Dedicated OpenAI service in server/services/openai.ts
- **Configuration**: Environment variable based API key management
- **Error Handling**: Comprehensive error handling for API failures

### API Structure
- `GET /api/messages` - Retrieve all chat messages
- `POST /api/chat` - Send message and receive AI response
- Input validation using Zod schemas
- Consistent error response format

## Data Flow

1. **Message Sending**: User inputs message → Frontend validates → API call to `/api/chat`
2. **AI Processing**: Backend saves user message → Calls OpenAI API → Saves AI response
3. **Data Fetching**: Frontend queries `/api/messages` → Displays conversation history
4. **Real-time Updates**: TanStack Query invalidates cache after successful message send

## External Dependencies

### Frontend Dependencies
- **UI Components**: Extensive Radix UI component collection
- **State Management**: TanStack React Query for server state
- **Form Handling**: React Hook Form with Hookform Resolvers
- **Styling**: TailwindCSS with Autoprefixer
- **Icons**: Lucide React icon library
- **Date Handling**: date-fns for date formatting

### Backend Dependencies
- **Database**: Neon Database serverless PostgreSQL
- **ORM**: Drizzle ORM with Drizzle-Zod for validation
- **AI**: OpenAI API client
- **Session**: PostgreSQL session store (connect-pg-simple)
- **Validation**: Zod for runtime type checking

### Development Tools
- **TypeScript**: Strict type checking across the stack
- **Vite**: Development server with HMR and build optimization
- **ESBuild**: Fast TypeScript compilation for production
- **Replit Integration**: Cartographer plugin and runtime error overlay

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with proxy to backend
- Express server with hot reload using tsx
- Environment variables loaded from .env files
- Replit-specific development banner and error handling

### Production Build
- Frontend: Vite builds to `dist/public` directory
- Backend: ESBuild compiles TypeScript to `dist/index.js`
- Static file serving through Express in production
- Environment-based configuration switching

### Database Strategy
- Drizzle configuration for PostgreSQL connection
- Environment variable based database URL
- Migration system using Drizzle Kit
- Prepared for easy PostgreSQL integration (currently using in-memory storage)

## Changelog
- July 07, 2025. Initial setup
- July 07, 2025. Added dark mode functionality with theme toggle button

## User Preferences

Preferred communication style: Simple, everyday language.