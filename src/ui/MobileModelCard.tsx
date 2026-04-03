import { MobileModelCardInfo } from './MobileModelCardInfo';
import { MobileModelCardProgress } from './MobileModelCardProgress';
import './MobileModelCard.css';

interface MobileModelCardProps {
  name: string;
  description: string;
  size: string;
  isDownloaded: boolean;
  isDownloading: boolean;
  downloadProgress?: number;
  statusMessage?: string;
  error?: string;
  onDownload: () => void;
}

export function MobileModelCard({
  name,
  description,
  size,
  isDownloaded,
  isDownloading,
  downloadProgress = 0,
  statusMessage,
  error,
  onDownload,
}: MobileModelCardProps) {
  return (
    <div className="model-card">
      <MobileModelCardInfo
        name={name}
        description={description}
        size={size}
        isDownloaded={isDownloaded}
      />

      {isDownloading ? (
        <MobileModelCardProgress
          progress={downloadProgress}
          statusMessage={statusMessage}
          error={error}
        />
      ) : (
        <button 
          className={`download-btn ${isDownloaded ? 'downloaded' : ''}`}
          onClick={onDownload}
          disabled={isDownloaded}
        >
          {isDownloaded ? '✓ HERUNTERGELADEN' : '⬇ HERUNTERLADEN'}
        </button>
      )}
    </div>
  );
}
