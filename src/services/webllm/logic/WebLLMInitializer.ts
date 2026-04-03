import Logger from '@services/logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let engine: any = null;

export class WebLLMInitializer {
  static async initializeModel(currentModel: { value: string | null }, isLoading: { value: boolean }, initPromise: { value: Promise<void> | null }, modelName: string, onStatusMessage?: (message: string) => void): Promise<void> {
    Logger.infoService(`[webllmService] Starting model initialization for: ${modelName}`);
    
    if (initPromise.value) {
      Logger.infoService(`[webllmService] Initialization already in progress, waiting...`);
      return initPromise.value;
    }

    isLoading.value = true;
    initPromise.value = (async () => {
      try {
        Logger.infoService(`[webllmService] Attempting to load @mlc-ai/web-llm library...`);
        const { MLCEngine } = await import('@mlc-ai/web-llm');
        Logger.infoService(`[webllmService] @mlc-ai/web-llm imported successfully`);
        
        Logger.infoService(`[webllmService] Creating MLCEngine instance for model: ${modelName}`);
        engine = new MLCEngine({
          initProgressCallback: (progress: any) => {
            const message = progress.text || 'Initializing model...';
            Logger.cache(`[webllmService.initializeModel] MLCEngine init progress: ${message}`);
            onStatusMessage?.(message);
          },
        });
        
        Logger.infoService(`[webllmService] Loading model: ${modelName}`);
        await engine.reload(modelName, {
          context_window_size: 2048,
          temperature: 0.7,
        });
        Logger.infoService(`[webllmService] ✅ Real model loaded successfully: ${modelName}`);
        
        currentModel.value = modelName;
        Logger.infoService(`[webllmService] Model initialization complete: ${modelName}`);
      } catch (error) {
        Logger.errorStack(
          `[webllmService] ❌ FEHLER: Könnte Web-LLM nicht laden für ${modelName}`,
          error instanceof Error ? error : new Error(String(error))
        );
        throw error;
      } finally {
        isLoading.value = false;
        initPromise.value = null;
      }
    })();

    return initPromise.value;
  }

  static getEngine() {
    return engine;
  }

  static setEngine(e: any) {
    engine = e;
  }
}
