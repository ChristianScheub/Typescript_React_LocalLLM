import Logger from './logger';

// Global model state management
class ModelStateManager {
  private loadedModels: Map<string, Set<string>> = new Map();
  private listeners: Set<() => void> = new Set();

  constructor() {
    Logger.infoService(`[modelStateManager] Initializing ModelStateManager`);
    this.loadedModels.set('transformers', new Set());
    this.loadedModels.set('webllm', new Set());
    Logger.infoService(`[modelStateManager] Providers initialized: transformers, webllm`);
  }

  markModelAsLoaded(provider: 'transformers' | 'webllm', modelId: string): void {
    Logger.infoService(`[modelStateManager.markModelAsLoaded] Marking model as loaded - Provider: ${provider}, Model: ${modelId}`);
    const models = this.loadedModels.get(provider);
    if (models) {
      Logger.infoService(`[modelStateManager.markModelAsLoaded] Provider exists, adding model to set`);
      models.add(modelId);
      Logger.infoService(`[modelStateManager.markModelAsLoaded] Model added. Total loaded for ${provider}: ${models.size}`);
      this.notifyListeners();
    } else {
      Logger.errorService(`[modelStateManager.markModelAsLoaded] Provider not found: ${provider}`);
    }
  }

  isModelLoaded(provider: 'transformers' | 'webllm', modelId: string): boolean {
    const models = this.loadedModels.get(provider);
    const loaded = models ? models.has(modelId) : false;
    Logger.cache(`[modelStateManager.isModelLoaded] Provider: ${provider}, Model: ${modelId}, Loaded: ${loaded}`);
    return loaded;
  }

  getLoadedModels(provider: 'transformers' | 'webllm'): Set<string> {
    const models = this.loadedModels.get(provider) || new Set();
    Logger.cache(`[modelStateManager.getLoadedModels] Provider: ${provider}, Count: ${models.size}, Models: ${Array.from(models).join(', ') || 'none'}`);
    return models;
  }

  subscribe(callback: () => void): () => void {
    Logger.infoService(`[modelStateManager.subscribe] New subscriber added. Total listeners: ${this.listeners.size + 1}`);
    this.listeners.add(callback);
    return () => {
      Logger.infoService(`[modelStateManager.unsubscribe] Subscriber removed. Total listeners: ${this.listeners.size - 1}`);
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    Logger.infoService(`[modelStateManager.notifyListeners] Notifying ${this.listeners.size} listeners...`);
    let index = 0;
    this.listeners.forEach((listener) => {
      index++;
      Logger.cache(`[modelStateManager.notifyListeners] Calling listener ${index}/${this.listeners.size}`);
      listener();
    });
  }
}

export const modelStateManager = new ModelStateManager();
