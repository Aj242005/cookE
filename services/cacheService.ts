/**
 * Simple in-memory cache with expiration to optimize performance.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const DEFAULT_TTL = 1000 * 60 * 30; // 30 minutes

class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Generates a cache key based on prompt and context
   */
  generateKey(prompt: string, context: any): string {
    return `${prompt.trim()}-${JSON.stringify(context)}`;
  }
}

export const apiCache = new CacheService();