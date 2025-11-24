import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
} from '@aws-sdk/client-bedrock-runtime';

export interface GenerationOptions {
  maxTokens: number;
  temperature?: number;
  topP?: number;
  stopSequences?: string[];
}

export interface BedrockResponse {
  content: string;
  tokensUsed: number;
  finishReason: string;
}

export class BedrockService {
  private client: BedrockRuntimeClient;
  private modelId: string;

  constructor(region?: string, modelId?: string) {
    this.client = new BedrockRuntimeClient({
      region: region || process.env.AWS_REGION || 'us-east-1',
    });
    this.modelId = modelId || process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0';
  }

  async generateResponse(
    prompt: string,
    context: string[],
    options: GenerationOptions
  ): Promise<BedrockResponse> {
    try {
      // Construct the full prompt with context
      const fullPrompt = this.buildPrompt(prompt, context);

      // Prepare the request payload for Claude models
      const payload = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: options.maxTokens,
        temperature: options.temperature ?? 0.7,
        top_p: options.topP ?? 0.9,
        messages: [
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
        ...(options.stopSequences && { stop_sequences: options.stopSequences }),
      };

      const input: InvokeModelCommandInput = {
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload),
      };

      const command = new InvokeModelCommand(input);
      const response = await this.client.send(command);

      if (!response.body) {
        throw new Error('No response body received from Bedrock');
      }

      // Parse the response
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      // Extract content and token usage from Claude response format
      const content = responseBody.content?.[0]?.text || '';
      const tokensUsed = (responseBody.usage?.input_tokens || 0) + (responseBody.usage?.output_tokens || 0);
      const finishReason = responseBody.stop_reason || 'unknown';

      return {
        content,
        tokensUsed,
        finishReason,
      };
    } catch (error) {
      // Handle rate limiting
      if (error instanceof Error && error.name === 'ThrottlingException') {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Handle other API failures
      if (error instanceof Error) {
        throw new Error(`Bedrock API error: ${error.message}`);
      }

      throw new Error('Unknown error occurred while calling Bedrock API');
    }
  }

  private buildPrompt(prompt: string, context: string[]): string {
    if (context.length === 0) {
      return prompt;
    }

    const contextSection = context.join('\n\n');
    return `Context:\n${contextSection}\n\nQuestion: ${prompt}`;
  }

  /**
   * Test connection to Bedrock service
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.generateResponse('Hello', [], { maxTokens: 10 });
      return true;
    } catch {
      return false;
    }
  }
}

// Export a singleton instance
let bedrockServiceInstance: BedrockService | null = null;

export function getBedrockService(): BedrockService {
  if (!bedrockServiceInstance) {
    bedrockServiceInstance = new BedrockService();
  }
  return bedrockServiceInstance;
}
