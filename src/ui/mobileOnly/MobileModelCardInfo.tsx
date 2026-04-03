import './MobileModelCardInfo.css';

interface MobileModelCardInfoProps {
  name: string;
  description: string;
  size: string;
  isDownloaded: boolean;
}

export function MobileModelCardInfo({ name, description, size, isDownloaded }: MobileModelCardInfoProps) {
  return (
    <div className="model-info">
      <h4>{name}</h4>
      <p className="model-description">{description}</p>
      <div className="model-meta">
        <span className={`status ${isDownloaded ? 'ready' : ''}`}>
          {isDownloaded ? '● BEREIT' : '○ NICHT GELADEN'}
        </span>
        <span className="model-size">{size}</span>
      </div>
    </div>
  );
}
