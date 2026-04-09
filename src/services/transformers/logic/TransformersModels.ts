import Logger from '@services/logger';
import { TransformersInitializer } from '@services/transformers/logic/TransformersInitializer';
import type { TransformersModel } from '@services/transformers/ITransformersService';

export interface TransformersModelConfig extends TransformersModel {
  id: string;
  label: string;
  dtype: string;
  type: 'causal' | 'multimodal';
  multimodal: boolean;
  contextSize: number;
  genConfig: {
    temperature: number;
    top_k: number;
    top_p: number;
    max_new_tokens: number;
    repetition_penalty?: number;
  };
}

// Models exactly as implemented in GemmaLocalUse.html
// These are ONNX-community models that work with Transformers.js
const MODELS: Record<string, TransformersModelConfig> = {
  'gemma3-1b': {
    id: 'onnx-community/gemma-3-1b-it-ONNX-GQA',
    name: 'Gemma 3 1B',
    label: 'Gemma 3 1B',
    description: 'Fast · 1B parameters · Instruction-tuned · Good for weak hardware',
    size: '~760 MB',
    downloaded: false,
    family: 'Gemma',
    dtype: 'q4f16',
    type: 'causal',
    multimodal: false,
    contextSize: 4096,
    genConfig: { temperature: 0.7, top_k: 50, top_p: 0.95, max_new_tokens: 2048 },
  },
  'gemma4-e2b': {
    id: 'onnx-community/gemma-4-E2B-it-ONNX',
    name: 'Gemma 4 E2B',
    label: 'Gemma 4 E2B',
    description: 'Multimodal · 2B parameters · Text + Image + Audio · Efficient',
    size: '~1.5 GB',
    downloaded: false,
    family: 'Gemma',
    dtype: 'q4f16',
    type: 'multimodal',
    multimodal: true,
    contextSize: 8192,
    genConfig: { temperature: 0.7, top_k: 40, top_p: 0.95, max_new_tokens: 2048, repetition_penalty: 1.1 },
  },
  'gemma4-e4b': {
    id: 'onnx-community/gemma-4-E4B-it-ONNX',
    name: 'Gemma 4 E4B',
    label: 'Gemma 4 E4B',
    description: 'Multimodal · 4B parameters · Text + Image + Audio · High quality',
    size: '~4.9 GB',
    downloaded: false,
    family: 'Gemma',
    dtype: 'q4f16',
    type: 'multimodal',
    multimodal: true,
    contextSize: 12288,
    genConfig: { temperature: 0.7, top_k: 40, top_p: 0.95, max_new_tokens: 2048, repetition_penalty: 1.1 },
  },
};

export class TransformersModels {
  static getAvailableModels(): TransformersModel[] {
    Logger.infoService(`[transformersModels] ${Object.keys(MODELS).length} models available`);
    return Object.values(MODELS);
  }

  static getModelConfig(modelKeyOrId: string): TransformersModelConfig | undefined {
    // Try direct lookup by key
    if (MODELS[modelKeyOrId]) {
      return MODELS[modelKeyOrId];
    }
    // Try lookup by model ID
    const found = Object.values(MODELS).find(m => m.id === modelKeyOrId);
    return found;
  }

  static getModelKeyByIdOrKey(modelKeyOrId: string): string | undefined {
    // Try direct lookup by key
    if (MODELS[modelKeyOrId]) {
      return modelKeyOrId;
    }
    // Try lookup by model ID
    const found = Object.entries(MODELS).find(([_, m]) => m.id === modelKeyOrId);
    return found?.[0];
  }

  static getDtype(modelKeyOrId: string): string {
    const config = this.getModelConfig(modelKeyOrId);
    return config?.dtype ?? 'q4f16';
  }

  static async downloadModel(
    currentModel: { value: string | null },
    isLoading: { value: boolean },
    modelKeyOrId: string,
    onProgress?: (progress: number) => void,
    onStatusMessage?: (message: string) => void,
  ): Promise<void> {
    Logger.infoService(`[transformersModels] Starting download: ${modelKeyOrId}`);

    const modelConfig = this.getModelConfig(modelKeyOrId);
    if (!modelConfig) {
      throw new Error(`Model not found: ${modelKeyOrId}`);
    }

    const modelKey = this.getModelKeyByIdOrKey(modelKeyOrId);
    if (!modelKey) {
      throw new Error(`Could not resolve model key for: ${modelKeyOrId}`);
    }

    try {
      onProgress?.(5);
      onStatusMessage?.('Connecting to HuggingFace…');

      await TransformersInitializer.initializeModel(
        currentModel,
        isLoading,
        modelKey,
        modelConfig,
        (msg) => {
          onStatusMessage?.(msg);
          // Extract percentage and map to progress
          const match = msg.match(/(\d+)%/);
          if (match) {
            const pct = parseInt(match[1], 10);
            onProgress?.(10 + Math.round(pct * 0.8));
          }
        },
      );

      onProgress?.(100);
      onStatusMessage?.('Model loaded ✅');
      Logger.infoService(`[transformersModels] ✅ Download complete: ${modelKeyOrId}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Logger.errorStack(
        `[transformersModels] Download failed: ${modelKeyOrId}`,
        error instanceof Error ? error : new Error(errorMsg),
      );
      throw error;
    }
  }

  static isModelLoaded(currentModel: { value: string | null }, isLoading: { value: boolean }): boolean {
    const loaded = !!currentModel.value && !isLoading.value && !!TransformersInitializer.getPipeline();
    Logger.cache(`[transformersModels] isModelLoaded: ${loaded ? '✅' : '❌'}`);
    return loaded;
  }

  static getStatus(currentModel: { value: string | null }, isLoading: { value: boolean }) {
    return {
      loaded: this.isModelLoaded(currentModel, isLoading),
      model: currentModel.value,
      pipeline: !!TransformersInitializer.getPipeline(),
    };
  }
}
