import { useTranslation } from 'react-i18next';
import './MobileModelCardInfo.css';

interface MobileModelCardInfoProps {
  name: string;
  description: string;
  size: string;
  isDownloaded: boolean;
}

export function MobileModelCardInfo({ name, description, size, isDownloaded }: MobileModelCardInfoProps) {
  const { t } = useTranslation();

  return (
    <div className="model-info">
      <h4>{name}</h4>
      <p className="model-description">{description}</p>
      <div className="model-meta">
        <span className={`status ${isDownloaded ? 'ready' : ''}`}>
          {isDownloaded ? t('models.ready') : t('models.notLoaded')}
        </span>
        <span className="model-size">{size}</span>
      </div>
    </div>
  );
}
