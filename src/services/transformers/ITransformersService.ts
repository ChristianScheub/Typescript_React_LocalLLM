import type { ModelFamily } from '@services/webllm/IWebllmService';

export interface TransformersModel {
  id: string;
  name: string;
  description: string;
  size: string;
  downloaded: boolean;
  family: ModelFamily;
}

export interface TransformersGenerateOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

export interface ITransformersService {
  initializeModel(modelName: string, onStatusMessage?: (message: string) => void): Promise<void>;
  generate(prompt: string, options?: { temperature?: number; maxTokens?: number; presencePenalty?: number; mode?: 'fast' | 'expert' }): Promise<string>;
  downloadModel(modelName: string, onProgress?: (progress: number) => void, onStatusMessage?: (message: string) => void): Promise<void>;
  isModelLoaded(): boolean;
  getCurrentModel(): string | null;
  getAvailableModels(): TransformersModel[];
  getStatus(): { loaded: boolean; model: string | null; pipeline: boolean; };
}
