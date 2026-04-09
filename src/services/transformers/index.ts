import { TransformersInitializer } from '@services/transformers/logic/TransformersInitializer';
import { TransformersGenerator } from '@services/transformers/logic/TransformersGenerator';
import { TransformersModels } from '@services/transformers/logic/TransformersModels';
import type { ITransformersService, TransformersModel } from '@services/transformers/ITransformersService';

// Internal state references for the facade
const state = {
  currentModel: { value: null as string | null },
  isLoading: { value: false }
};

const transformersService: ITransformersService = {
  initializeModel: (modelName, onStatusMessage) => {
    const modelConfig = TransformersModels.getModelConfig(modelName);
    if (!modelConfig) {
      return Promise.reject(new Error(`Model not found: ${modelName}`));
    }
    const modelKey = TransformersModels.getModelKeyByIdOrKey(modelName) || modelName;
    return TransformersInitializer.initializeModel(state.currentModel, state.isLoading, modelKey, modelConfig, onStatusMessage);
  },
  generate: (prompt, options) => TransformersGenerator.generate(state.currentModel, state.isLoading, prompt, options),
  downloadModel: (modelName, onProgress, onStatusMessage) => TransformersModels.downloadModel(state.currentModel, state.isLoading, modelName, onProgress, onStatusMessage),
  isModelLoaded: () => TransformersModels.isModelLoaded(state.currentModel, state.isLoading),
  getCurrentModel: () => state.currentModel.value,
  getAvailableModels: () => TransformersModels.getAvailableModels(),
  getStatus: () => TransformersModels.getStatus(state.currentModel, state.isLoading),
};

export { transformersService };
export type { ITransformersService, TransformersModel };
