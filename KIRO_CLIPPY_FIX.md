# Kiro Clippy Fix

## Problem

Clippy in the Kiro editor was trying to call AWS Bedrock directly from the client-side code, which failed because:
- Environment variables (AWS_BEARER_TOKEN_BEDROCK) are only available server-side
- Bedrock SDK cannot run in the browser
- Error: "AWS_BEARER_TOKEN_BEDROCK environment variable is required for authentication"

## Solution

Created a dedicated API route for code assistance that runs server-side.

### Changes Made

1. **Created `/api/code-assist` route** (`src/app/api/code-assist/route.ts`)
   - Handles code assistance requests server-side
   - Uses `getClippyConfig('code')` for proper configuration
   - Accepts: prompt, fileName, language, code, cursorPosition
   - Returns: AI-generated response from Bedrock

2. **Updated Kiro editor** (`src/apps/Kiro.tsx`)
   - Removed direct Bedrock service imports
   - Changed `handleAIAssist()` to call `/api/code-assist` API
   - Sends code context via HTTP POST request
   - Handles responses and errors properly

### Architecture

```
Kiro Editor (Client)
    ↓ HTTP POST
/api/code-assist (Server)
    ↓ Uses
getBedrockService() + getClippyConfig('code')
    ↓ Calls
AWS Bedrock API
```

### Benefits

✅ **Security**: API keys stay server-side
✅ **Consistency**: Uses same config system as floating Clippy
✅ **Reliability**: Proper error handling
✅ **Maintainability**: Follows Next.js API route pattern

## Testing

1. Open Kiro editor from desktop or Start Menu
2. Type code in the editor
3. Ask Clippy a question (e.g., "make me a hello world")
4. Clippy should respond with code assistance

## API Endpoints

| Endpoint | Purpose | Config |
|----------|---------|--------|
| `/api/chat` | Floating Clippy | `DEFAULT_CLIPPY_CONFIG` |
| `/api/code-assist` | Kiro Editor Clippy | `CODE_CLIPPY_CONFIG` |

Both use the centralized `getBedrockService()` singleton and `getClippyConfig()` system.
