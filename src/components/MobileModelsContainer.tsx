import { useState, useEffect } from 'react';
import { modelService } from '@services/model';
import { modelStateManager } from '@services/modelStateManager';
import Logger from '@services/logger';
import { MobileModelsView } from '@views/MobileModels/MobileModelsView';

interface MobileModelsContainerProps {
  provider: 'transformers' | 'webllm';
  onProviderChange: (provider: 'transformers' | 'webllm') => void;
}

export function MobileModelsContainer({ provider, onProviderChange }: MobileModelsContainerProps) {
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadedModels, setLoadedModels] = useState<Set<string>>(new Set());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const loaded = modelStateManager.getLoadedModels(provider);
    setLoadedModels(loaded);
    
    const unsubscribe = modelStateManager.subscribe(() => {
      const updated = modelStateManager.getLoadedModels(provider);
      setLoadedModels(new Set(updated));
    });
    
    return () => unsubscribe();
  }, [provider]);

  const models = modelService.getModelsByProvider(provider).map(model => ({
    ...model,
    downloaded: loadedModels.has(model.id)
  }));

  const handleDownloadModel = async (modelId: string) => {
    setDownloadingModel(modelId);
    setDownloadProgress(0);
    setStatusMessage(null);
    setError(null);
    
    try {
      await modelService.downloadModel(
        provider,
        modelId,
        (progress) => {
          setDownloadProgress(progress);
        },
        (message) => {
          setStatusMessage(message);
        }
      );
      
      modelStateManager.markModelAsLoaded(provider, modelId);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Download failed';
      Logger.errorStack(`[MobileModelsContainer] Download failed for ${modelId}`, err instanceof Error ? err : new Error(errorMsg));
      setError(errorMsg);
    } finally {
      setDownloadingModel(null);
      setDownloadProgress(0);
      setStatusMessage(null);
    }
  };

  const handleToggleProvider = () => {
    const newProvider = provider === 'webllm' ? 'transformers' : 'webllm';
    onProviderChange(newProvider);
  };

  return (
    <MobileModelsView
      provider={provider}
      models={models as { id: string; name: string; description: string; size: string; downloaded: boolean }[]}
      downloadingModel={downloadingModel}
      downloadProgress={downloadProgress}
      statusMessage={statusMessage}
      error={error}
      onDownload={handleDownloadModel}
      onToggleProvider={handleToggleProvider}
    />
  );
}
