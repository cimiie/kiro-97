import { NextRequest, NextResponse } from 'next/server';
import { getBedrockService } from '@/services/bedrock';
import { getMCPService } from '@/services/mcp';
import { getClippyConfig } from '@/config/clippy';

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, maxTokens, context, conversationHistory, sessionTokensUsed } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check session token limit (10k tokens per session)
    const SESSION_LIMIT = 10000;
    if (sessionTokensUsed && sessionTokensUsed >= SESSION_LIMIT) {
      return NextResponse.json(
        { error: 'Session token limit reached. Please refresh the page to start a new session.' },
        { status: 429 }
      );
    }

    // Initialize services
    const bedrockService = getBedrockService();
    const mcpService = getMCPService();

    // Build enhanced prompt with conversation history and context
    const enhancedPrompt = message;
    const contextArray: string[] = [];

    // Add current context if provided
    if (context) {
      contextArray.push(`Current Context: ${context}`);
    }

    // Add conversation history for continuity
    if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      const historyText = conversationHistory
        .map((msg: ConversationMessage) => `${msg.role}: ${msg.content}`)
        .join('\n');
      contextArray.push(`Recent Conversation:\n${historyText}`);
    }

    // Add system prompt for Clippy personality from centralized config
    const clippyConfig = getClippyConfig('default');
    contextArray.unshift(clippyConfig.systemPrompt);

    // Query MCP for AWS documentation context if relevant
    const docResults = await mcpService.queryDocumentation(message);
    if (docResults.length > 0) {
      const docContext = docResults.map((doc) => `${doc.title}\n${doc.content}`);
      contextArray.push(...docContext);
    }

    // Generate response using Bedrock with Clippy config
    const response = await bedrockService.generateResponse(
      enhancedPrompt,
      contextArray,
      {
        maxTokens: maxTokens || clippyConfig.maxTokens,
        temperature: clippyConfig.temperature,
        topP: clippyConfig.topP,
      }
    );

    return NextResponse.json({
      content: response.content,
      tokensUsed: response.tokensUsed,
      finishReason: response.finishReason,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred' 
      },
      { status: 500 }
    );
  }
}
