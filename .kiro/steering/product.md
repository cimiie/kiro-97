# Product Overview

A nostalgic browser-based Windows 95 emulator that recreates the classic desktop experience with modern web technologies.

## Key Features

- Authentic Windows 95 UI with draggable/resizable windows
- Functional taskbar with Start Menu and desktop icons
- Built-in applications including Minesweeper, Kiro code editor
- AI-powered Clippy assistant using AWS Bedrock
- Mock Internet Explorer browser with AWS content

## Target Experience

Recreate the look, feel, and functionality of Windows 95 in a modern browser while adding AI-enhanced features through the Clippy assistant.

## AI Assistant - Clippy

**Important**: When referring to AI assistance features in this project, always use the name "Clippy". This is our AWS Bedrock-powered AI assistant that provides:

- Conversational assistance (floating Clippy character)
- Code assistance in the Kiro editor
- Context-aware help throughout the Windows 95 environment

### Technical Implementation

All AI features are implemented using AWS Bedrock (Amazon Nova Lite model by default):

- **Service**: `BedrockService` class in `src/services/bedrock.ts`
- **Architecture**: Server-side only via Next.js API routes
- **Security**: API keys and credentials never exposed to client
- **API Routes**:
  - `/api/chat` - Floating Clippy conversations
  - `/api/code-assist` - Kiro editor code assistance

**Rule**: Never call Bedrock directly from client components. Always use API routes.
