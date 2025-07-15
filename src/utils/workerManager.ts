/**
 * Web Worker Manager
 * 
 * Provides:
 * - Worker thread communication
 * - Heavy computation offloading
 * - Performance monitoring
 * - Error handling
 */

interface WorkerMessage {
  type: string;
  data?: any;
  id: string;
}

interface WorkerResponse {
  type: 'SUCCESS' | 'ERROR';
  id: string;
  result?: any;
  error?: string;
}

class WorkerManager {
  private worker: Worker | null = null;
  private pendingRequests: Map<string, { resolve: Function; reject: Function }> = new Map();
  private isSupported: boolean;

  constructor() {
    this.isSupported = typeof Worker !== 'undefined';
    this.initializeWorker();
  }

  /**
   * Initialize web worker
   */
  private initializeWorker() {
    if (!this.isSupported) {
      console.warn('Web Workers not supported');
      return;
    }

    try {
      this.worker = new Worker('/worker.js');
      this.worker.addEventListener('message', this.handleWorkerMessage.bind(this));
      this.worker.addEventListener('error', this.handleWorkerError.bind(this));
      console.log('Web Worker initialized');
    } catch (error) {
      console.error('Failed to initialize Web Worker:', error);
      this.isSupported = false;
    }
  }

  /**
   * Handle messages from worker
   */
  private handleWorkerMessage(event: MessageEvent<WorkerResponse>) {
    const { type, id, result, error } = event.data;
    
    const pendingRequest = this.pendingRequests.get(id);
    if (!pendingRequest) {
      console.warn('Received response for unknown request:', id);
      return;
    }

    this.pendingRequests.delete(id);

    if (type === 'SUCCESS') {
      pendingRequest.resolve(result);
    } else {
      pendingRequest.reject(new Error(error));
    }
  }

  /**
   * Handle worker errors
   */
  private handleWorkerError(error: ErrorEvent) {
    console.error('Web Worker error:', error);
    
    // Reject all pending requests
    this.pendingRequests.forEach(({ reject }) => {
      reject(new Error('Worker error occurred'));
    });
    this.pendingRequests.clear();
  }

  /**
   * Send message to worker and return promise
   */
  private sendMessage(message: WorkerMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.worker || !this.isSupported) {
        reject(new Error('Web Worker not available'));
        return;
      }

      this.pendingRequests.set(message.id, { resolve, reject });
      this.worker.postMessage(message);
    });
  }

  /**
   * Generate unique ID for requests
   */
  private generateId(): string {
    return `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Filter fruits using worker thread
   */
  async filterFruits(fruits: any[], criteria: any): Promise<any> {
    return this.sendMessage({
      type: 'FILTER_FRUITS',
      data: { fruits, criteria },
      id: this.generateId()
    });
  }

  /**
   * Sort fruits using worker thread
   */
  async sortFruits(fruits: any[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): Promise<any> {
    return this.sendMessage({
      type: 'SORT_FRUITS',
      data: { fruits, sortBy, sortOrder },
      id: this.generateId()
    });
  }

  /**
   * Calculate statistics using worker thread
   */
  async calculateStatistics(fruits: any[]): Promise<any> {
    return this.sendMessage({
      type: 'CALCULATE_STATISTICS',
      data: { fruits },
      id: this.generateId()
    });
  }

  /**
   * Process large dataset using worker thread
   */
  async processLargeDataset(dataset: any[], operations: any[]): Promise<any> {
    return this.sendMessage({
      type: 'PROCESS_LARGE_DATASET',
      data: { dataset, operations },
      id: this.generateId()
    });
  }

  /**
   * Group fruits using worker thread
   */
  async groupFruits(fruits: any[], groupBy: string): Promise<any> {
    return this.sendMessage({
      type: 'GROUP_FRUITS',
      data: { fruits, groupBy },
      id: this.generateId()
    });
  }

  /**
   * Search fruits using worker thread
   */
  async searchFruits(fruits: any[], query: string): Promise<any> {
    return this.sendMessage({
      type: 'SEARCH_FRUITS',
      data: { fruits, query },
      id: this.generateId()
    });
  }

  /**
   * Check if worker is supported and available
   */
  isWorkerSupported(): boolean {
    return this.isSupported && this.worker !== null;
  }

  /**
   * Terminate worker
   */
  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingRequests.clear();
  }
}

// Create singleton instance
export const workerManager = new WorkerManager();

// Export for use in components
export default workerManager; 