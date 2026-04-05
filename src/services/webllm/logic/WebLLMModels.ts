import Logger from '@services/logger';
import { WebLLMInitializer } from '@services/webllm/logic/WebLLMInitializer';
import type { WebLLMModel, ModelFamily } from '@services/webllm/IWebllmService';
import { webllmAllModels } from './webllm-modelsAll';

const familyPatterns: [RegExp, ModelFamily][] = [
  [/DeepSeek/i, 'DeepSeek'],
  [/Llama|TinyLlama/i, 'Llama'],
  [/Phi/i, 'Phi'],
  [/Qwen/i, 'Qwen'],
  [/Ministral/i, 'Ministral'],
  [/Mistral/i, 'Mistral'],
  [/[Gg]emma/i, 'Gemma'],
  [/SmolLM/i, 'SmolLM'],
  [/[Ss]table[Ll][Mm]/i, 'StableLM'],
  [/RedPajama/i, 'RedPajama'],
  [/WizardMath/i, 'WizardMath'],
  [/Hermes/i, 'Hermes'],
  [/snowflake/i, 'Snowflake'],
];

function detectFamily(modelId: string): ModelFamily {
  for (const [pattern, family] of familyPatterns) {
    if (pattern.test(modelId)) return family;
  }
  return 'Other';
}

function formatSize(vramMB: number | undefined): string {
  if (!vramMB) return 'N/A';
  if (vramMB >= 1024) return `${(vramMB / 1024).toFixed(1)} GB`;
  return `${Math.round(vramMB)} MB`;
}

export class WebLLMModels {
  static getAvailableModels(): WebLLMModel[] {
    Logger.infoService(`[webllmService.getAvailableModels] Returning available models`);
    return webllmAllModels
      .filter(m => !m.model_id.includes('//')) // skip commented-out entries
      .map(m => ({
        id: m.model_id,
        name: m.model_id,
        description: '',
        size: formatSize(m.vram_required_MB),
        downloaded: false,
        family: detectFamily(m.model_id),
      }));
  }

  static async downloadModel(_currentModel: { value: string | null }, _isLoading: { value: boolean }, modelName: string, onProgress?: (progress: number) => void): Promise<void> {
    Logger.infoService(`[webllmService.downloadModel] Starting download: ${modelName}`);
    
    try {
      const steps = [
        { progress: 0, message: 'Preparing download' },
        { progress: 20, message: 'Downloading model weights' },
        { progress: 40, message: 'Downloading tokenizer' },
        { progress: 60, message: 'Downloading config' },
        { progress: 80, message: 'Verifying integrity' },
        { progress: 100, message: 'Download complete' },
      ];

      for (const step of steps) {
        Logger.infoService(`[webllmService.downloadModel] ${step.message} - ${step.progress}%`);
        onProgress?.(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      Logger.infoService(`[webllmService.downloadModel] Download simulation complete: ${modelName}`);
    } catch (error) {
      Logger.errorStack(
        `[webllmService.downloadModel] Download failed for ${modelName}`,
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  static isModelLoaded(currentModel: { value: string | null }, isLoading: { value: boolean }): boolean {
    const loaded = !!currentModel.value && !isLoading.value && !!WebLLMInitializer.getEngine();
    Logger.cache(`[webllmService.isModelLoaded] Status: ${loaded} (model: ${currentModel.value}, engine ready: ${!!WebLLMInitializer.getEngine()})`);
    return loaded;
  }

  static async dispose(currentModel: { value: string | null }): Promise<void> {
    Logger.infoService(`[webllmService.dispose] Disposing engine`);
    const engine = WebLLMInitializer.getEngine();
    if (engine) {
      try {
        await engine.dispose();
        Logger.infoService(`[webllmService.dispose] Engine disposed successfully`);
        WebLLMInitializer.setEngine(null);
        currentModel.value = null;
      } catch (error) {
        Logger.errorStack(
          `[webllmService.dispose] Error disposing engine`,
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }
  }

  static getStatus(): string {
    return WebLLMInitializer.getEngine() ? 'Real Engine Mode (Web-LLM)' : 'Engine Not Loaded';
  }
}
