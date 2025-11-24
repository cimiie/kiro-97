# Clippy Configuration Migration

## Summary

Centralized all Clippy (AI assistant) configuration into a single, reusable config system.

## Changes Made

### 1. Created Centralized Config (`src/config/clippy.ts`)

- **`DEFAULT_CLIPPY_CONFIG`**: For conversational assistance (1000 tokens, friendly personality)
- **`CODE_CLIPPY_CONFIG`**: For code assistance (2000 tokens, expert programmer personality)
- **`getClippyConfig(type)`**: Helper function to get the appropriate config

### 2. Updated Chat API (`src/app/api/chat/route.ts`)

- Now imports and uses `getClippyConfig('default')`
- Removed hardcoded system prompt and parameters
- Uses centralized config for consistency

### 3. Updated Kiro Editor (`src/apps/KiroIDE.tsx`)

- Now imports and uses `getClippyConfig('code')`
- Includes code-specific system prompt in context
- Uses centralized config parameters (maxTokens, temperature, topP)

### 4. Updated Documentation

- **`.kiro/steering/tech.md`**: Added Clippy architecture section
- **`src/config/README.md`**: Created config usage guide
- **`.kiro/steering/product.md`**: Already documented Clippy as the AI assistant name

## Benefits

✅ **Single Source of Truth**: All Clippy behavior defined in one place
✅ **Easy Maintenance**: Update AI personality/parameters globally
✅ **Consistent Experience**: Same Clippy personality across all features
✅ **Extensible**: Easy to add new config profiles for future features
✅ **Shared Resources**: Single Bedrock service instance via `getBedrockService()`

## Usage for Future Features

When adding new AI-powered features:

```typescript
import { getBedrockService } from '@/services/bedrock';
import { getClippyConfig } from '@/config/clippy';

const bedrock = getBedrockService();
const config = getClippyConfig('code'); // or 'default'

const response = await bedrock.generateResponse(
  userPrompt,
  [config.systemPrompt, ...yourContext],
  {
    maxTokens: config.maxTokens,
    temperature: config.temperature,
    topP: config.topP
  }
);
```

## Current Implementations

| Feature | Config Profile | Location |
|---------|---------------|----------|
| Floating Clippy | `default` | `/api/chat` |
| Kiro Editor | `code` | `src/apps/KiroIDE.tsx` |

## Environment Variables

No changes to environment variables. Still uses:
- `AWS_BEARER_TOKEN_BEDROCK`
- `AWS_REGION`
- `BEDROCK_MODEL_ID`
- `BEDROCK_INFERENCE_PROFILE_ARN` (optional)
