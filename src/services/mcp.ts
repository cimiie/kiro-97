export interface DocumentationResult {
  title: string;
  content: string;
  url: string;
  relevanceScore: number;
}

export interface ServiceDocumentation {
  serviceName: string;
  description: string;
  features: string[];
  documentation: string;
}

export interface MCPCache {
  [key: string]: {
    data: DocumentationResult[] | ServiceDocumentation;
    timestamp: number;
  };
}

export class MCPService {
  private cache: MCPCache = {};
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Query AWS documentation through MCP server
   * In production, this would connect to the actual MCP server
   * For now, it provides a structure for integration
   */
  async queryDocumentation(query: string): Promise<DocumentationResult[]> {
    try {
      // Check cache first
      const cacheKey = `query:${query}`;
      const cached = this.getFromCache(cacheKey);
      if (cached && Array.isArray(cached)) {
        return cached;
      }

      // In a real implementation, this would call the MCP server
      // For now, we'll return a structure that can be populated
      const results = await this.fetchDocumentationFromMCP(query);

      // Cache the results
      this.setCache(cacheKey, results);

      return results;
    } catch (error) {
      // Handle MCP connection failures gracefully
      console.error('MCP documentation query failed:', error);
      
      // Return cached results if available, even if expired
      const cacheKey = `query:${query}`;
      const cached = this.getFromCache(cacheKey, true);
      if (cached && Array.isArray(cached)) {
        return cached;
      }

      // Return empty results rather than throwing
      return [];
    }
  }

  /**
   * Get information about a specific AWS service
   */
  async getServiceInfo(serviceName: string): Promise<ServiceDocumentation> {
    try {
      // Check cache first
      const cacheKey = `service:${serviceName}`;
      const cached = this.getFromCache(cacheKey);
      if (cached && !Array.isArray(cached)) {
        return cached;
      }

      // In a real implementation, this would call the MCP server
      const serviceInfo = await this.fetchServiceInfoFromMCP(serviceName);

      // Cache the results
      this.setCache(cacheKey, serviceInfo);

      return serviceInfo;
    } catch (error) {
      // Handle MCP connection failures gracefully
      console.error('MCP service info query failed:', error);

      // Return cached results if available, even if expired
      const cacheKey = `service:${serviceName}`;
      const cached = this.getFromCache(cacheKey, true);
      if (cached && !Array.isArray(cached)) {
        return cached;
      }

      // Return empty service info rather than throwing
      return {
        serviceName,
        description: 'Service information unavailable',
        features: [],
        documentation: '',
      };
    }
  }

  /**
   * Fetch documentation from MCP server
   * This is a placeholder for actual MCP integration
   */
  private async fetchDocumentationFromMCP(query: string): Promise<DocumentationResult[]> {
    // In production, this would use the MCP protocol to query the aws-docs server
    // For now, return a structure that indicates MCP integration is needed
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // This would be replaced with actual MCP calls
    // Example: const response = await mcpClient.call('search_documentation', { query });
    
    return [
      {
        title: `AWS Documentation for: ${query}`,
        content: 'MCP integration pending - this will fetch real AWS documentation',
        url: `https://docs.aws.amazon.com/search?q=${encodeURIComponent(query)}`,
        relevanceScore: 0.9,
      },
    ];
  }

  /**
   * Fetch service information from MCP server
   * This is a placeholder for actual MCP integration
   */
  private async fetchServiceInfoFromMCP(serviceName: string): Promise<ServiceDocumentation> {
    // In production, this would use the MCP protocol to query the aws-docs server
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // This would be replaced with actual MCP calls
    // Example: const response = await mcpClient.call('get_service_info', { service: serviceName });
    
    return {
      serviceName,
      description: `AWS ${serviceName} service`,
      features: ['Feature 1', 'Feature 2'],
      documentation: 'MCP integration pending - this will fetch real service documentation',
    };
  }

  /**
   * Get item from cache if not expired
   */
  private getFromCache(
    key: string,
    ignoreExpiry = false
  ): DocumentationResult[] | ServiceDocumentation | null {
    const cached = this.cache[key];
    if (!cached) {
      return null;
    }

    const isExpired = Date.now() - cached.timestamp > this.cacheTimeout;
    if (isExpired && !ignoreExpiry) {
      delete this.cache[key];
      return null;
    }

    return cached.data;
  }

  /**
   * Store item in cache
   */
  private setCache(key: string, data: DocumentationResult[] | ServiceDocumentation): void {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
    };
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache = {};
  }

  /**
   * Test MCP connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.queryDocumentation('test');
      return true;
    } catch {
      return false;
    }
  }
}

// Export a singleton instance
let mcpServiceInstance: MCPService | null = null;

export function getMCPService(): MCPService {
  if (!mcpServiceInstance) {
    mcpServiceInstance = new MCPService();
  }
  return mcpServiceInstance;
}
