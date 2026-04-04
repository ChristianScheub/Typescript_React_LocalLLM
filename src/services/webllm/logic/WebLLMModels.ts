import Logger from '@services/logger';
import { WebLLMInitializer } from '@services/webllm/logic/WebLLMInitializer';
import type { WebLLMModel } from '@services/webllm/IWebllmService';

export class WebLLMModels {
  static getAvailableModels(): WebLLMModel[] {
    Logger.infoService(`[webllmService.getAvailableModels] Returning available models`);
    return [
      {
        id: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
        name: 'Phi-3.5 Mini (Q4, 3.8B)',
        description: 'Exzellente Logik und Reasoning bei sehr geringem Speicherverbrauch.',
        size: '3.6 GB',
        downloaded: false,
      },
      {
        id: 'Llama-3.2-3B-Instruct-q4f32_1-MLC',
        name: 'Llama 3.2 3B (Q4, 3.2B)',
        description: 'Sehr stabiler und schneller Allrounder von Meta.',
        size: '2.9 GB',
        downloaded: false,
      },
      {
        id: 'Qwen3-4B-q4f32_1-MLC',
        name: 'Qwen 3 Coder (Q4, 4B)',
        description: 'Spezialisiert auf Coding; schlägt oft deutlich größere Modelle.',
        size: '4.2 GB',
        downloaded: false,
      },
      {
        id: 'Ministral-3-3B-Instruct-2512-BF16-q4f16_1-MLC',
        name: 'Ministral 3 3B (Q4, 3B)',
        description: 'Die neueste Generation kompakter Modelle von Mistral (Ende 2025).',
        size: '3.1 GB',
        downloaded: false,
      },
      {
        id: 'Llama-3.4-8B-Instruct-q4f16_1-MLC',
        name: 'Llama 3.4 8B (Q4, 8B)',
        description: 'Maximale Intelligenz für komplexe Aufgaben (erfordert min. 8GB RAM).',
        size: '4.9 GB',
        downloaded: false,
      },
      {
        id: 'Llama-2-7b-hf-q4f32_1-MLC',
        name: 'Llama-2 7B (Q4, 7B)',
        description: 'Klassisches Modell (Legacy), deutlich langsamer als Llama 3.x.',
        size: '8.9 GB',
        downloaded: false,
      },
      {
        id: 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC',
        name: 'TinyLlama Chat 1.1B',
        size: '~800MB',
        description: 'Kleines, schnelles Chat-Modell für lokale Verwendung',
        downloaded: false,
      },
      {
        id: 'Llama-2-7b-chat-hf-q4f16_1-MLC',
        name: 'Llama 2 7B Chat',
        size: '~4GB',
        description: 'Leistungsstarkes Chat-Modell (mehr Speicher erforderlich)',
        downloaded: false
      },
      {
        id: 'Phi-3-mini-4k-instruct-q4f16_1-MLC',
        name: 'Phi-3 Mini 4K',
        size: '~2GB',
        description: 'Microsoft Phi-3 Modell für Instruction Following',
        downloaded: false
      }
    ];
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
