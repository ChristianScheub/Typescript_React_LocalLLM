import Logger from '@services/logger';
import { TransformersInitializer } from '@services/transformers/logic/TransformersInitializer';
import type { TransformersModel } from '@services/transformers/ITransformersService';

interface TransformersModelConfig extends TransformersModel {
  dtype: string;
}

const MODELS: TransformersModelConfig[] = [
  // ── Gemma 4 (Google, ONNX Community) ──────────────────────────────────────
  {
    id: 'onnx-community/gemma-4-E2B-it-ONNX',
    name: 'Gemma 4 E2B Instruct',
    description: 'Google Gemma 4 · 2B effektive Parameter · Text, Bild, Audio, 128K Kontext',
    size: '~1.2 GB (q4)',
    downloaded: false,
    family: 'Gemma',
    dtype: 'q4',
  },
  {
    id: 'onnx-community/gemma-4-E4B-it-ONNX',
    name: 'Gemma 4 E4B Instruct',
    description: 'Google Gemma 4 · 4B effektive Parameter · Text, Bild, Audio, 128K Kontext',
    size: '~2.3 GB (q4)',
    downloaded: false,
    family: 'Gemma',
    dtype: 'q4',
  },
  {
    id: 'onnx-community/gemma-3n-E2B-it-ONNX',
    name: 'Gemma 3n E2B Instruct',
    description: 'Google Gemma 3n · 2B effektive Parameter · Text, Bild, Audio, 32K Kontext',
    size: '~1.1 GB (q4)',
    downloaded: false,
    family: 'Gemma',
    dtype: 'q4',
  },
  {
    id: 'onnx-community/gemma-2-9b-it-ONNX-DirectML-GenAI-INT4',
    name: 'Gemma 2.9B DirectML INT4',
    description: 'Google Gemma 2.9B · DirectML INT4 quantisiert · Windows optimiert',
    size: '~1.5 GB (int4)',
    downloaded: false,
    family: 'Gemma',
    dtype: 'int4',
  },
  // ── Gemma 3 (Google) ──────────────────────────────────────────────────────
  {
    id: 'onnx-community/gemma-3-1b-it',
    name: 'Gemma 3 1B Instruct',
    description: 'Google Gemma 3 · 1B Parameter · Instruction-tuned · gut für mobile Geräte',
    size: '~600 MB (q4)',
    downloaded: false,
    family: 'Gemma',
    dtype: 'q4',
  },
  {
    id: 'onnx-community/gemma-3-4b-it',
    name: 'Gemma 3 4B Instruct',
    description: 'Google Gemma 3 · 4B Parameter · Instruction-tuned · höchste Qualität im Transformers-Bereich',
    size: '~2.3 GB (q4)',
    downloaded: false,
    family: 'Gemma',
    dtype: 'q4',
  },

  // ── SmolLM2 (HuggingFace) ─────────────────────────────────────────────────
  {
    id: 'HuggingFaceTB/SmolLM2-135M-Instruct',
    name: 'SmolLM2 135M Instruct',
    description: 'Extrem schnell · 135M Parameter · ideal für schwache Hardware',
    size: '~90 MB',
    downloaded: false,
    family: 'SmolLM',
    dtype: 'fp32',
  },
  {
    id: 'HuggingFaceTB/SmolLM2-360M-Instruct',
    name: 'SmolLM2 360M Instruct',
    description: 'Sehr schnell · 360M Parameter · gute Balance aus Speed & Qualität',
    size: '~200 MB',
    downloaded: false,
    family: 'SmolLM',
    dtype: 'fp32',
  },
  {
    id: 'HuggingFaceTB/SmolLM2-1.7B-Instruct',
    name: 'SmolLM2 1.7B Instruct',
    description: 'Ausgewogen · 1.7B Parameter · empfohlen als Standard-Wahl',
    size: '~1 GB (q4)',
    downloaded: false,
    family: 'SmolLM',
    dtype: 'q4',
  },

  // ── Qwen 2.5 (Alibaba) ───────────────────────────────────────────────────
  {
    id: 'onnx-community/Qwen2.5-0.5B-Instruct',
    name: 'Qwen 2.5 0.5B Instruct',
    description: 'Alibaba Qwen 2.5 · 0.5B Parameter · mehrsprachig, sehr schnell',
    size: '~300 MB',
    downloaded: false,
    family: 'Qwen',
    dtype: 'q4',
  },
  {
    id: 'onnx-community/Qwen2.5-1.5B-Instruct',
    name: 'Qwen 2.5 1.5B Instruct',
    description: 'Alibaba Qwen 2.5 · 1.5B Parameter · mehrsprachig, gute Qualität',
    size: '~900 MB (q4)',
    downloaded: false,
    family: 'Qwen',
    dtype: 'q4',
  },
];

export class TransformersModels {
  static getAvailableModels(): TransformersModel[] {
    Logger.infoService(`[transformersService.getAvailableModels] ${MODELS.length} Modelle verfügbar`);
    return MODELS;
  }

  static getDtype(modelId: string): string {
    return MODELS.find(m => m.id === modelId)?.dtype ?? 'q4';
  }

  static async downloadModel(
    currentModel: { value: string | null },
    isLoading: { value: boolean },
    modelName: string,
    onProgress?: (progress: number) => void,
    onStatusMessage?: (message: string) => void,
  ): Promise<void> {
    Logger.infoService(`[transformersService.downloadModel] Start: ${modelName}`);

    try {
      const dtype = TransformersModels.getDtype(modelName);

      // Animate progress 0→10% while model files are actually streaming
      onProgress?.(5);
      onStatusMessage?.('Verbinde mit HuggingFace…');

      await TransformersInitializer.initializeModel(
        currentModel,
        isLoading,
        modelName,
        (msg) => {
          // Forward status messages and bump progress while downloading
          onStatusMessage?.(msg);
          // Extract percentage from messages like "Downloading model.onnx: 42%"
          const match = msg.match(/(\d+)%/);
          if (match) {
            const pct = parseInt(match[1], 10);
            // Map 0-100% download to 10-90% for the UI
            onProgress?.(10 + Math.round(pct * 0.8));
          }
        },
        dtype as 'q4' | 'fp32' | 'fp16',
      );

      onProgress?.(100);
      onStatusMessage?.('Modell geladen ✅');
      Logger.infoService(`[transformersService.downloadModel] ✅ Fertig: ${modelName}`);
    } catch (error) {
      Logger.errorStack(
        `[transformersService.downloadModel] Fehler: ${modelName}`,
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  }

  static isModelLoaded(currentModel: { value: string | null }, isLoading: { value: boolean }): boolean {
    const loaded = !!currentModel.value && !isLoading.value && !!TransformersInitializer.getPipeline();
    Logger.cache(`[transformersService.isModelLoaded] ${loaded ? '✅' : '❌'} (${currentModel.value})`);
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
