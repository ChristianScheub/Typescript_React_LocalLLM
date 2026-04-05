export type ModelFamily = 'Llama' | 'Phi' | 'Qwen' | 'Ministral' | 'Mistral' | 'DeepSeek' | 'Gemma' | 'SmolLM' | 'StableLM' | 'RedPajama' | 'WizardMath' | 'Hermes' | 'Snowflake' | 'GPT' | 'Other';

export interface WebLLMModel {
  id: string;
  name: string;
  description: string;
  size: string;
  downloaded: boolean;
  family: ModelFamily;
}

export interface WebLLMGenerateOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

export interface IWebllmService {
  initializeModel(modelName: string, onStatusMessage?: (message: string) => void): Promise<void>;
  generate(prompt: string, options?: { temperature?: number; maxTokens?: number; presencePenalty?: number; mode?: 'fast' | 'expert' }): Promise<string>;
  downloadModel(modelName: string, onProgress?: (progress: number) => void): Promise<void>;
  isModelLoaded(): boolean;
  getCurrentModel(): string | null;
  getAvailableModels(): WebLLMModel[];
  dispose(): Promise<void>;
  getStatus(): string;
}
