import { MobileModelCard } from '@ui/MobileModelCard';
import { MobileEngineSelector } from '@ui/MobileEngineSelector';
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
  return (
    <div className="mobile-models-view">
      <div className="models-header">
        <h2>Engine-Architektur</h2>
        <p>Wählen Sie die Laufzeitumgebung, die am besten zu Ihrer Hardware passt</p>
      </div>

      <MobileEngineSelector 
        currentProvider={provider}
        onToggle={onToggleProvider}
      />

      <div className="models-section">
        <h3>Verfügbare Modelle</h3>
        <p className="models-subtitle">Bibliothek von Gewichten, die mit Ihrer aktuellen Engine kompatibel sind.</p>

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
