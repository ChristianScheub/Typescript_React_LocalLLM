import { WebLLMInitializer } from '@services/webllm/logic/WebLLMInitializer';
import { WebLLMGenerator } from '@services/webllm/logic/WebLLMGenerator';
import { WebLLMModels } from '@services/webllm/logic/WebLLMModels';
import { webllmAllModels } from '@services/webllm/logic/webllm-modelsAll';
import type { IWebllmService, WebLLMModel } from '@services/webllm/IWebllmService';

// Internal state references for the facade
const state = {
  currentModel: { value: null as string | null },
  isLoading: { value: false },
  initPromise: { value: null as Promise<void> | null }
};

const webllmService: IWebllmService = {
  initializeModel: (modelName, onStatusMessage) => WebLLMInitializer.initializeModel(state.currentModel, state.isLoading, state.initPromise, modelName, onStatusMessage),
  generate: (prompt, options) => WebLLMGenerator.generate(state.currentModel, state.isLoading, prompt, options),
  downloadModel: (modelName, onProgress) => WebLLMModels.downloadModel(state.currentModel, state.isLoading, modelName, onProgress),
  isModelLoaded: () => WebLLMModels.isModelLoaded(state.currentModel, state.isLoading),
  getCurrentModel: () => state.currentModel.value,
  getAvailableModels: () => WebLLMModels.getAvailableModels(),
  dispose: () => WebLLMModels.dispose(state.currentModel),
  getStatus: () => WebLLMModels.getStatus(),
};

export { webllmService, webllmAllModels };
export type { IWebllmService, WebLLMModel };
