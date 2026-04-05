import { MobileModelCardInfo } from './MobileModelCardInfo';
import { MobileModelCardProgress } from './MobileModelCardProgress';
import { useTranslation } from 'react-i18next';
import './MobileModelCard.css';

interface MobileModelCardProps {
  name: string;
  description: string;
  size: string;
  isDownloaded: boolean;
  isCached?: boolean;
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
  isCached,
  isDownloading,
  downloadProgress = 0,
  statusMessage,
  error,
  onDownload,
}: MobileModelCardProps) {
  const { t } = useTranslation();

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
          className={`download-btn ${isDownloaded ? 'downloaded' : isCached ? 'cached' : ''}`}
          onClick={onDownload}
          disabled={isDownloaded}
        >
          {isDownloaded ? t('models.downloaded') : isCached ? t('models.cached', '↻ IM CACHE') : t('models.download')}
        </button>
      )}
    </div>
  );
}
