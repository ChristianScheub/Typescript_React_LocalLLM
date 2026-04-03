import { useState, useEffect } from 'react';
import { modelService } from '@services/model';
import { modelStateManager } from '@services/modelStateManager';
import Logger from '@services/logger';
import { SettingsView } from '@views/settings/SettingsView';

interface ModelsContainerProps {
  provider: 'transformers' | 'webllm';
  onProviderChange: (provider: 'transformers' | 'webllm') => void;
}

export function ModelsContainer({ provider, onProviderChange }: ModelsContainerProps) {
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadedModels, setLoadedModels] = useState<Set<string>>(new Set());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    Logger.infoService(`[ModelsContainer] Initializing for provider: ${provider}`);
    const loaded = modelStateManager.getLoadedModels(provider);
    Logger.infoService(`[ModelsContainer] Found ${loaded.size} loaded models for provider: ${provider}`);
    setLoadedModels(loaded);
    
    const unsubscribe = modelStateManager.subscribe(() => {
      Logger.infoService(`[ModelsContainer] ModelStateManager updated for provider: ${provider}`);
      const updated = modelStateManager.getLoadedModels(provider);
      Logger.infoService(`[ModelsContainer] Updated loaded models count: ${updated.size}`);
      setLoadedModels(new Set(updated));
    });
    
    return () => {
      Logger.infoService(`[ModelsContainer] Unsubscribing from modelStateManager`);
      unsubscribe();
    };
  }, [provider]);

  const models = modelService.getModelsByProvider(provider).map(model => {
    const isLoaded = loadedModels.has(model.id);
    Logger.cache(`[ModelsContainer] Model ${model.id}: ${isLoaded ? 'loaded' : 'not loaded'}`);
    return {
      ...model,
      downloaded: isLoaded
    };
  });

  const handleDownloadModel = async (modelId: string) => {
    Logger.infoService(`[ModelsContainer.handleDownloadModel] Starting download for model: ${modelId} (provider: ${provider})`);
    setDownloadingModel(modelId);
    setDownloadProgress(0);
    setStatusMessage(null);
    setError(null);
    
    try {
      Logger.infoService(`[ModelsContainer.handleDownloadModel] Calling modelService.downloadModel with progress callback`);
      await modelService.downloadModel(
        provider,
        modelId,
        (progress) => {
          Logger.cache(`[ModelsContainer.handleDownloadModel] Progress update: ${progress}%`);
          setDownloadProgress(progress);
        },
        (message) => {
          Logger.cache(`[ModelsContainer.handleDownloadModel] Status message: ${message}`);
          setStatusMessage(message);
        }
      );
      
      Logger.infoService(`[ModelsContainer.handleDownloadModel] Download complete for model: ${modelId}`);
      Logger.infoService(`[ModelsContainer.handleDownloadModel] Marking model as loaded in state: ${modelId}`);
      // Mark model as loaded in the global state
      modelStateManager.markModelAsLoaded(provider, modelId);
      Logger.infoService(`[ModelsContainer.handleDownloadModel] Model marked as loaded successfully`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Download failed';
      Logger.errorStack(`[ModelsContainer.handleDownloadModel] Download failed for ${modelId}`, err instanceof Error ? err : new Error(errorMsg));
      setError(errorMsg);
    } finally {
      Logger.infoService(`[ModelsContainer.handleDownloadModel] Download process complete`);
      setDownloadingModel(null);
      setDownloadProgress(0);
      setStatusMessage(null);
    }
  };

  return (
    <SettingsView
      currentProvider={provider}
      onProviderChange={onProviderChange}
      models={models as { id: string; name: string; description: string; size: string; downloaded: boolean }[]}
      downloadingModel={downloadingModel}
      downloadProgress={downloadProgress}
      onDownload={handleDownloadModel}
      error={error}
      statusMessage={statusMessage}
    />
  );
}
