import { MobileModelCard } from '@ui/mobileOnly/MobileModelCard';
import { MobileEngineSelector } from '@ui/mobileOnly/MobileEngineSelector';
import { useTranslation } from 'react-i18next';
import './MobileModelsView.css';

interface Model {
  id: string;
  name: string;
  description: string;
  size: string;
  downloaded: boolean;
}

interface MobileModelsViewProps {
  provider: 'transformers' | 'webllm';
  models: Model[];
  downloadingModel: string | null;
  downloadProgress: number;
  statusMessage: string | null;
  error: string | null;
  onDownload: (modelId: string) => void;
  onToggleProvider: () => void;
}

export function MobileModelsView({
  provider,
  models,
  downloadingModel,
  downloadProgress,
  statusMessage,
  error,
  onDownload,
  onToggleProvider,
}: MobileModelsViewProps) {
  const { t } = useTranslation();

  return (
    <div className="mobile-models-view">
      <div className="models-header">
        <h2>{t('models.engineArchitecture')}</h2>
        <p>{t('models.selectRuntime')}</p>
      </div>

      <MobileEngineSelector 
        currentProvider={provider}
        onToggle={onToggleProvider}
      />

      <div className="models-section">
        <h3>{t('models.availableModels')}</h3>
        <p className="models-subtitle">{t('models.modelsSubtitle')}</p>

        <div className="models-list">
          {models.map((model) => (
            <MobileModelCard
              key={model.id}
              name={model.name}
              description={model.description}
              size={model.size}
              isDownloaded={model.downloaded}
              isDownloading={downloadingModel === model.id}
              downloadProgress={downloadProgress}
              statusMessage={statusMessage || undefined}
              error={error || undefined}
              onDownload={() => onDownload(model.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
