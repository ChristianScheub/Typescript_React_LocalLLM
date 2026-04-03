import type { TransformersModel } from '@services/transformers';
import type { WebLLMModel } from '@services/webllm';

export interface ModelState {
  provider: 'transformers' | 'webllm';
  currentModel: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  presencePenalty?: number;
  mode?: 'fast' | 'expert';
}

export interface IModelService {
  getModelsByProvider(provider: 'transformers' | 'webllm'): TransformersModel[] | WebLLMModel[];
  initializeModel(provider: 'transformers' | 'webllm', modelName: string): Promise<void>;
  generateResponse(provider: 'transformers' | 'webllm', prompt: string, options?: GenerationOptions): Promise<string>;
  isModelLoaded(provider: 'transformers' | 'webllm'): boolean;
  getCurrentModel(provider: 'transformers' | 'webllm'): string | null;
  downloadModel(provider: 'transformers' | 'webllm', modelName: string, onProgress?: (progress: number) => void, onStatusMessage?: (message: string) => void): Promise<void>;
}
