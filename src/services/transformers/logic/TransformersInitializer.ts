import Logger from '@services/logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pipeline: any = null;

export class TransformersInitializer {
  static async initializeModel(currentModel: { value: string | null }, isLoading: { value: boolean }, modelName: string, onStatusMessage?: (message: string) => void): Promise<void> {
    Logger.infoService(`[transformersService] Starting model initialization for: ${modelName}`);
    isLoading.value = true;
    
    try {
      Logger.infoService(`[transformersService] Importing @xenova/transformers library...`);
      const { pipeline: huggingFacePipeline } = await import('@xenova/transformers');
      Logger.infoService(`[transformersService] ✅ Xenova/Transformers imported successfully`);
      
      Logger.infoService(`[transformersService] Loading text-generation pipeline with model: ${modelName}`);
      Logger.infoService(`[transformersService] This may take a moment as the model is being downloaded...`);
      
      pipeline = await huggingFacePipeline('text-generation', modelName, {
        progress_callback: (progress: any) => {
          const message = `Loading model: ${Math.round((progress.progress || 0) * 100)}%`;
          Logger.cache(`[transformersService] Pipeline loading progress: ${JSON.stringify(progress).substring(0, 80)}`);
          onStatusMessage?.(message);
        }
      });
      
      Logger.infoService(`[transformersService] ✅✅✅ ECHTES MODELL VOLLSTÄNDIG GELADEN: ${modelName}`);
      currentModel.value = modelName;
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Logger.errorStack(
        `[transformersService] KRITISCH: Modell-Initialization fehlgeschlagen für ${modelName}`,
        error instanceof Error ? error : new Error(errorMsg)
      );
      Logger.infoService(`[transformersService] Details: ${errorMsg.substring(0, 200)}`);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  static getPipeline() {
    return pipeline;
  }

  static setPipeline(p: any) {
    pipeline = p;
  }
}
