import { useState, useEffect } from 'react';
import { modelService } from '@services/model';
import { modelStateManager } from '@services/modelStateManager';
import Logger from '@services/logger';
import { SettingsModalView } from '@views/settings/SettingsModalView';

interface SettingsContainerProps {
  provider: 'transformers' | 'webllm';
  onProviderChange: (provider: 'transformers' | 'webllm') => void;
  isModalOpen: boolean;
  onModalClose: () => void;
}

export function SettingsContainer({ provider, onProviderChange, isModalOpen, onModalClose }: SettingsContainerProps) {
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadedModels, setLoadedModels] = useState<Set<string>>(new Set());

  useEffect(() => {
    Logger.infoService(`[SettingsContainer] Initializing for provider: ${provider}`);
    const loaded = modelStateManager.getLoadedModels(provider);
    Logger.infoService(`[SettingsContainer] Found ${loaded.size} loaded models for provider: ${provider}`);
    setLoadedModels(loaded);
    
    const unsubscribe = modelStateManager.subscribe(() => {
      Logger.infoService(`[SettingsContainer] ModelStateManager updated for provider: ${provider}`);
      const updated = modelStateManager.getLoadedModels(provider);
      Logger.infoService(`[SettingsContainer] Updated loaded models count: ${updated.size}`);
      setLoadedModels(new Set(updated));
    });
    
    return () => {
      Logger.infoService(`[SettingsContainer] Unsubscribing from modelStateManager`);
      unsubscribe();
    };
  }, [provider]);

  const models = modelService.getModelsByProvider(provider).map(model => {
    const isLoaded = loadedModels.has(model.id);
    Logger.cache(`[SettingsContainer] Model ${model.id}: ${isLoaded ? 'loaded' : 'not loaded'}`);
    return {
      ...model,
      downloaded: isLoaded
    };
  });

  const handleDownloadModel = async (modelId: string) => {
    Logger.infoService(`[SettingsContainer.handleDownloadModel] Starting download for model: ${modelId} (provider: ${provider})`);
    setDownloadingModel(modelId);
    setDownloadProgress(0);
    setError(null);
    
    try {
      Logger.infoService(`[SettingsContainer.handleDownloadModel] Calling modelService.downloadModel with progress callback`);
      await modelService.downloadModel(
        provider,
        modelId,
        (progress) => {
          Logger.cache(`[SettingsContainer.handleDownloadModel] Progress update: ${progress}%`);
          setDownloadProgress(progress);
        }
      );
      
      Logger.infoService(`[SettingsContainer.handleDownloadModel] Download complete for model: ${modelId}`);
      Logger.infoService(`[SettingsContainer.handleDownloadModel] Marking model as loaded in state: ${modelId}`);
      // Mark model as loaded in the global state
      modelStateManager.markModelAsLoaded(provider, modelId);
      Logger.infoService(`[SettingsContainer.handleDownloadModel] Model marked as loaded successfully`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Download failed';
      Logger.errorStack(`[SettingsContainer.handleDownloadModel] Download failed for ${modelId}`, err instanceof Error ? err : new Error(errorMsg));
      setError(errorMsg);
    } finally {
      Logger.infoService(`[SettingsContainer.handleDownloadModel] Download process complete`);
      setDownloadingModel(null);
      setDownloadProgress(0);
    }
  };

  return (
    <SettingsModalView
      isOpen={isModalOpen}
      onClose={() => {
        Logger.infoService(`[SettingsContainer] Closing settings modal`);
        onModalClose();
      }}
      currentProvider={provider}
      onProviderChange={onProviderChange}
      models={models as { id: string; name: string; description: string; size: string; downloaded: boolean }[]}
      downloadingModel={downloadingModel}
      downloadProgress={downloadProgress}
      onDownload={handleDownloadModel}
      error={error}
    />
  );
}
