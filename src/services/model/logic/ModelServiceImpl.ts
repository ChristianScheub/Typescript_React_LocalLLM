import type { GenerationOptions } from '@services/model/IModelService';

// Dependencies (will be injected via setDependencies)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let transformersService: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let webllmService: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Logger: any;

export class ModelServiceImpl {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static setDependencies(ts: any, wls: any, logger: any) {
    transformersService = ts;
    webllmService = wls;
    Logger = logger;
  }

  static getModelsByProvider(provider: 'transformers' | 'webllm') {
    Logger.infoService(`[modelService.getModelsByProvider] Fetching models for provider: ${provider}`);
    const models = provider === 'transformers' 
      ? transformersService.getAvailableModels()
      : webllmService.getAvailableModels();
    Logger.infoService(`[modelService.getModelsByProvider] Found ${models.length} models for ${provider}`);
    return models;
  }

  static async initializeModel(provider: 'transformers' | 'webllm', modelName: string): Promise<void> {
    Logger.infoService(`[modelService.initializeModel] Initializing ${modelName} with provider: ${provider}`);
    try {
      if (provider === 'transformers') {
        Logger.infoService(`[modelService.initializeModel] Using transformersService`);
        await transformersService.initializeModel(modelName);
      } else {
        Logger.infoService(`[modelService.initializeModel] Using webllmService`);
        await webllmService.initializeModel(modelName);
      }
      Logger.infoService(`[modelService.initializeModel] Model initialization successful: ${modelName}`);
    } catch (error) {
      Logger.errorStack(
        `[modelService.initializeModel] Failed to initialize ${modelName}`,
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  static async generateResponse(provider: 'transformers' | 'webllm', prompt: string, options?: GenerationOptions): Promise<string> {
    Logger.infoService(`[modelService.generateResponse] Generating response with provider: ${provider}`);
    Logger.infoService(`[modelService.generateResponse] Prompt length: ${prompt.length} characters`);
    
    let enhancedPrompt = prompt;
    if (options?.mode) {
      const prefix = options.mode === 'fast'
        ? 'Du bist ein hilfreicher Assistent. Antworte immer extrem kurz und prägnant, maximal in zwei Sätzen.\n\n'
        : 'Du bist ein Experte. Erkläre Konzepte ausführlich, nutze Bullet Points und gehe tief ins Detail.\n\n';
      
      const suffix = options.mode === 'fast'
        ? '\n\nAntworte kurz und prägnant.'
        : '\n\nBitte ausführlich antworten.';
      
      enhancedPrompt = prefix + prompt + suffix;
      Logger.infoService(`[modelService.generateResponse] Enhanced prompt with ${options.mode} mode`);
    }
    
    try {
      let response: string;
      if (provider === 'transformers') {
        Logger.infoService(`[modelService.generateResponse] Using transformersService`);
        response = await transformersService.generate(enhancedPrompt, options);
      } else {
        Logger.infoService(`[modelService.generateResponse] Using webllmService`);
        response = await webllmService.generate(enhancedPrompt, options);
      }
      Logger.infoService(`[modelService.generateResponse] Response generated. Length: ${response.length} characters`);
      return response;
    } catch (error) {
      Logger.errorStack(
        `[modelService.generateResponse] Generation failed`,
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  static isModelLoaded(provider: 'transformers' | 'webllm'): boolean {
    const loaded = provider === 'transformers'
      ? transformersService.isModelLoaded()
      : webllmService.isModelLoaded();
    Logger.cache(`[modelService.isModelLoaded] Provider: ${provider}, Loaded: ${loaded}`);
    return loaded;
  }

  static getCurrentModel(provider: 'transformers' | 'webllm'): string | null {
    const model = provider === 'transformers'
      ? transformersService.getCurrentModel()
      : webllmService.getCurrentModel();
    Logger.cache(`[modelService.getCurrentModel] Provider: ${provider}, Model: ${model}`);
    return model;
  }

  static async downloadModel(provider: 'transformers' | 'webllm', modelName: string, onProgress?: (progress: number) => void, onStatusMessage?: (message: string) => void): Promise<void> {
    Logger.infoService(`[modelService.downloadModel] Starting download: ${modelName} (provider: ${provider})`);
    try {
      if (provider === 'transformers') {
        Logger.infoService(`[modelService.downloadModel] Using transformersService for download`);
        await transformersService.downloadModel(modelName, onProgress, onStatusMessage);
      } else {
        Logger.infoService(`[modelService.downloadModel] Using webllmService for download`);
        await webllmService.downloadModel(modelName, onProgress);
        Logger.infoService(`[modelService.downloadModel] Download complete, initializing model...`);
        onStatusMessage?.('Initializing model...');
        await webllmService.initializeModel(modelName, onStatusMessage);
      }
      Logger.infoService(`[modelService.downloadModel] Download and initialization complete: ${modelName}`);
    } catch (error) {
      Logger.errorStack(
        `[modelService.downloadModel] Download failed for ${modelName}`,
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }
}
