import Logger from '@services/logger';
import { TransformersInitializer } from '@services/transformers/logic/TransformersInitializer';
import type { TransformersModel } from '@services/transformers/ITransformersService';

export class TransformersModels {
  static getAvailableModels(): TransformersModel[] {
    Logger.infoService(`[transformersService.getAvailableModels] Verfügbare Modelle werden zurückgegeben`);
    return [
      {
        id: 'distilgpt2',
        name: 'DistilGPT-2 (Tiny)',
        description: 'Der Super-Schnelle - 82M params, blitzschnell für Tests',
        size: '150 MB',
        downloaded: false,
        family: 'GPT',
      },
      {
        id: 'gpt2',
        name: 'GPT-2 (Small)',
        description: 'Der Klassiker - 124M params, gute Balance zwischen Speed & Qualität',
        size: '500 MB',
        downloaded: false,
        family: 'GPT',
      },
      {
        id: 'gpt2-medium',
        name: 'GPT-2 (Medium)',
        description: 'Der Ausgewogene - 355M params, bessere Qualität, etwas langsamer',
        size: '1.5 GB',
        downloaded: false,
        family: 'GPT',
      },
      {
        id: 'gpt2-large',
        name: 'GPT-2 (Large)',
        description: 'Der Große - 774M params, beste Qualität, braucht Zeit zum Laden',
        size: '3.0 GB',
        downloaded: false,
        family: 'GPT',
      },
    ];
  }

  static async downloadModel(currentModel: { value: string | null }, isLoading: { value: boolean }, modelName: string, onProgress?: (progress: number) => void, onStatusMessage?: (message: string) => void): Promise<void> {
    Logger.infoService(`[transformersService.downloadModel] Vorbereitung zum Download: ${modelName}`);
    Logger.infoService(`[transformersService.downloadModel] ⚠️ WICHTIG: Modell wird direkt vom transformers-Browser CDN geladen`);
    Logger.infoService(`[transformersService.downloadModel] Erste Nutzung kann 30-60 Sekunden dauern!`);
    
    try {
      Logger.infoService(`[transformersService.downloadModel] Browser lädt echtes Modell mit ONNX Runtime...`);
      Logger.infoService(`[transformersService.downloadModel] Die WASM-Runtime benötigt einige Zeit für Download+Caching`);
      
      for (let i = 0; i <= 50; i += 5) {
        Logger.cache(`[transformersService.downloadModel] Vorbereitung: ${i}%`);
        onProgress?.(i);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      Logger.infoService(`[transformersService.downloadModel] 🔄 Starte echte Modell-Initialization mit Transformers.js...`);
      Logger.infoService(`[transformersService.downloadModel] 🔄 Dies kann 30-60 Sekunden dauern - NICHT SCHLIESSEN!`);
      onStatusMessage?.('Initializing model with Transformers.js...');
      await TransformersInitializer.initializeModel(currentModel, isLoading, modelName, onStatusMessage);
      
      for (let i = 50; i <= 100; i += 5) {
        Logger.cache(`[transformersService.downloadModel] Finalisierung: ${i}%`);
        onProgress?.(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      Logger.infoService(`[transformersService.downloadModel] ✅✅✅ ECHTES MODELL ERFOLGREICH GELADEN & CACHED: ${modelName}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Logger.errorStack(
        `[transformersService.downloadModel] ❌ Download/Initialization fehlgeschlagen für ${modelName}`,
        error instanceof Error ? error : new Error(errorMsg)
      );
      Logger.infoService(`[transformersService.downloadModel] 📋 Details: ${errorMsg.substring(0, 300)}`);
      throw error;
    }
  }

  static isModelLoaded(currentModel: { value: string | null }, isLoading: { value: boolean }): boolean {
    const loaded = !!currentModel.value && !isLoading.value && !!TransformersInitializer.getPipeline();
    Logger.cache(`[transformersService.isModelLoaded] Status: ${loaded ? '✅ Geladen' : '❌ Nicht geladen'} (Modell: ${currentModel.value})`);
    return loaded;
  }

  static getStatus(currentModel: { value: string | null }, isLoading: { value: boolean }) {
    return {
      loaded: this.isModelLoaded(currentModel, isLoading),
      model: currentModel.value,
      pipeline: !!TransformersInitializer.getPipeline()
    };
  }
}
