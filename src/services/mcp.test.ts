import { describe, it, expect, beforeEach } from 'vitest';
import { MCPService } from './mcp';

describe('MCPService', () => {
  let service: MCPService;

  beforeEach(() => {
    service = new MCPService();
  });

  it('creates instance successfully', () => {
    expect(service).toBeInstanceOf(MCPService);
  });

  it('queries documentation and returns results', async () => {
    const results = await service.queryDocumentation('S3');
    
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('title');
    expect(results[0]).toHaveProperty('content');
    expect(results[0]).toHaveProperty('url');
    expect(results[0]).toHaveProperty('relevanceScore');
  });

  it('gets service information', async () => {
    const serviceInfo = await service.getServiceInfo('Lambda');
    
    expect(serviceInfo).toHaveProperty('serviceName');
    expect(serviceInfo).toHaveProperty('description');
    expect(serviceInfo).toHaveProperty('features');
    expect(serviceInfo).toHaveProperty('documentation');
    expect(serviceInfo.serviceName).toBe('Lambda');
  });

  it('caches documentation queries', async () => {
    const query = 'EC2';
    
    // First call
    const results1 = await service.queryDocumentation(query);
    
    // Second call should use cache
    const results2 = await service.queryDocumentation(query);
    
    expect(results1).toEqual(results2);
  });

  it('clears cache successfully', async () => {
    await service.queryDocumentation('S3');
    service.clearCache();
    
    // After clearing cache, should fetch again
    const results = await service.queryDocumentation('S3');
    expect(Array.isArray(results)).toBe(true);
  });

  it('handles connection test', async () => {
    const isConnected = await service.testConnection();
    expect(typeof isConnected).toBe('boolean');
  });
});
