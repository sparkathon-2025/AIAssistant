# AI Chat Application

## Overview

This is a modern full-stack AI chat application built with React frontend and Express backend. The application allows users to have conversations with an AI assistant powered by OpenAI's GPT-4o model. It features a clean, responsive interface using shadcn/ui components and TailwindCSS for styling.

Link: https://aia-ssistant.vercel.app/

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
- **Database**: MongoDB with Mongoose ODM
- **Current Storage**: MongoDB database storage (DatabaseStorage)
- **Schema**: Defined in shared/schema.ts with users and messages collections
- **Connection**: Local MongoDB instance running on port 27017

### Authentication & Authorization
- Currently not implemented but database schema includes users table for future implementation

### AI Integration
- **Provider**: OpenAI API with GPT-4o model
- **Service**: Dedicated OpenAI service in server/services/openai.ts
- **Configuration**: Environment variable based API key management
- **Error Handling**: Comprehensive error handling for API failures

### Voice Functionality
- **Speech Recognition**: Web Speech API for voice input
- **Text-to-Speech**: Web Speech Synthesis API for voice responses
- **Voice Controls**: Microphone toggle, auto-speak toggle, visual feedback
- **Browser Support**: Automatic detection and graceful fallback
- **AI Call**: Phone-like interface with OpenAI Whisper and TTS integration

### Visual Input Features
- **QR Code Scanning**: Camera-based QR code detection using jsQR library
- **Photo Upload**: Multi-image upload with preview and analysis capability
- **Image Processing**: Base64 encoding for AI analysis
- **Visual Feedback**: Real-time camera preview and upload status

### API Structure
- `GET /api/messages` - Retrieve all chat messages
- `POST /api/chat` - Send message and receive AI response
- `POST /api/ai-call` - Process voice queries (audio to audio)
- Input validation using Zod schemas
- Consistent error response format

### Application Flow
1. **Landing Page**: Users start at QR scanner landing page (`/`)
2. **QR Scanning**: Scan product QR codes to extract product IDs
3. **Product Chat**: Navigate to chat with `?productId=` parameter
4. **Auto-Query**: Automatically request product information on load
5. **Interactive Chat**: Continue conversation about the product
6. **AI Call**: Phone-like interface for voice queries at `/ai-call`

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
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Zod for runtime type checking
- **AI**: OpenAI API client
- **Connection**: MongoDB connection management with caching

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
- MongoDB connection with Mongoose ODM
- Environment variable based MongoDB URI
- Automatic connection caching for development
- Local MongoDB instance for development and testing

## Changelog
- July 07, 2025. Initial setup
- July 07, 2025. Added dark mode functionality with theme toggle button
- July 07, 2025. Integrated MongoDB database with Mongoose ODM
- July 07, 2025. Added voice command and voice assistant functionality
- July 07, 2025. Implemented QR code scanning and image upload capabilities
- July 07, 2025. Added QR landing page as entry point with product ID flow
- July 14, 2025. Added AI Call page with phone-like voice interface using OpenAI Whisper and TTS

## User Preferences

Preferred communication style: Simple, everyday language.