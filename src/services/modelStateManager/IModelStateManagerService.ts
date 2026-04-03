export interface IModelStateManagerService {
  markModelAsLoaded(provider: 'transformers' | 'webllm', modelId: string): void;
  isModelLoaded(provider: 'transformers' | 'webllm', modelId: string): boolean;
  getLoadedModels(provider: 'transformers' | 'webllm'): Set<string>;
  subscribe(callback: () => void): () => void;
}
