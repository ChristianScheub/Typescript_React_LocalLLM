import { transformersService } from './transformersService';
import type { TransformersModel } from './transformersService';
import { webllmService } from './webllmService';
import type { WebLLMModel } from './webllmService';
import Logger from './logger';

export interface ModelState {
  provider: 'transformers' | 'webllm';
  currentModel: string | null;
  isLoading: boolean;
  error: string | null;
}

class ModelService {
  getModelsByProvider(provider: 'transformers' | 'webllm'): TransformersModel[] | WebLLMModel[] {
    Logger.infoService(`[modelService.getModelsByProvider] Fetching models for provider: ${provider}`);
    const models = provider === 'transformers' 
      ? transformersService.getAvailableModels()
      : webllmService.getAvailableModels();
    Logger.infoService(`[modelService.getModelsByProvider] Found ${models.length} models for ${provider}`);
    return models;
  }

  async initializeModel(provider: 'transformers' | 'webllm', modelName: string): Promise<void> {
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

  async generateResponse(provider: 'transformers' | 'webllm', prompt: string): Promise<string> {
    Logger.infoService(`[modelService.generateResponse] Generating response with provider: ${provider}`);
    Logger.infoService(`[modelService.generateResponse] Prompt length: ${prompt.length} characters`);
    try {
      let response: string;
      if (provider === 'transformers') {
        Logger.infoService(`[modelService.generateResponse] Using transformersService`);
        response = await transformersService.generate(prompt);
      } else {
        Logger.infoService(`[modelService.generateResponse] Using webllmService`);
        response = await webllmService.generate(prompt);
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

  isModelLoaded(provider: 'transformers' | 'webllm'): boolean {
    const loaded = provider === 'transformers'
      ? transformersService.isModelLoaded()
      : webllmService.isModelLoaded();
    Logger.cache(`[modelService.isModelLoaded] Provider: ${provider}, Loaded: ${loaded}`);
    return loaded;
  }

  getCurrentModel(provider: 'transformers' | 'webllm'): string | null {
    const model = provider === 'transformers'
      ? transformersService.getCurrentModel()
      : webllmService.getCurrentModel();
    Logger.cache(`[modelService.getCurrentModel] Provider: ${provider}, Model: ${model}`);
    return model;
  }

  async downloadModel(provider: 'transformers' | 'webllm', modelName: string, onProgress?: (progress: number) => void, onStatusMessage?: (message: string) => void): Promise<void> {
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

export const modelService = new ModelService();
