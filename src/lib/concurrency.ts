import pLimit from 'p-limit';

export const concurrencyManager = {
  limit: pLimit(3), // Allow 3 concurrent LLM calls
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return this.limit(fn);
  },
  
  getStats() {
    return {
      activeCount: this.limit.activeCount,
      pendingCount: this.limit.pendingCount
    };
  }
};
