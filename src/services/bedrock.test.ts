import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BedrockService } from './bedrock';

// Mock the AWS SDK
vi.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: vi.fn().mockImplementation(() => ({
    send: vi.fn(),
  })),
  InvokeModelCommand: vi.fn(),
}));

describe('BedrockService', () => {
  let service: BedrockService;

  beforeEach(() => {
    service = new BedrockService('us-east-1', 'test-model');
  });

  it('creates instance with default configuration', () => {
    expect(service).toBeInstanceOf(BedrockService);
  });

  it('builds prompt with context', () => {
    const prompt = 'What is AWS?';
    const context = ['AWS is a cloud platform', 'It offers many services'];
    
    // Access private method through type assertion for testing
    const buildPrompt = (service as any).buildPrompt.bind(service);
    const result = buildPrompt(prompt, context);
    
    expect(result).toContain('Context:');
    expect(result).toContain('AWS is a cloud platform');
    expect(result).toContain('Question: What is AWS?');
  });

  it('builds prompt without context', () => {
    const prompt = 'What is AWS?';
    const context: string[] = [];
    
    const buildPrompt = (service as any).buildPrompt.bind(service);
    const result = buildPrompt(prompt, context);
    
    expect(result).toBe(prompt);
    expect(result).not.toContain('Context:');
  });
});
