import { transformersService } from '@services/transformers';
import { webllmService } from '@services/webllm';
import Logger from '@services/logger';
import { ModelServiceImpl } from '@services/model/logic/ModelServiceImpl';
import type { IModelService, GenerationOptions, ModelState } from '@services/model/IModelService';

// Initialize implementation with dependencies
ModelServiceImpl['setDependencies'](transformersService, webllmService, Logger);

const modelService: IModelService = {
  getModelsByProvider: (provider) => ModelServiceImpl.getModelsByProvider(provider),
  initializeModel: (provider, modelName) => ModelServiceImpl.initializeModel(provider, modelName),
  generateResponse: (provider, prompt, options) => ModelServiceImpl.generateResponse(provider, prompt, options),
  isModelLoaded: (provider) => ModelServiceImpl.isModelLoaded(provider),
  getCurrentModel: (provider) => ModelServiceImpl.getCurrentModel(provider),
  downloadModel: (provider, modelName, onProgress, onStatusMessage) => 
    ModelServiceImpl.downloadModel(provider, modelName, onProgress, onStatusMessage),
};

export { modelService };
export type { IModelService, GenerationOptions, ModelState };
