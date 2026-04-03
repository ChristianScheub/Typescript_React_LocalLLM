import './MobileModelCardProgress.css';

interface MobileModelCardProgressProps {
  progress: number;
  statusMessage?: string;
  error?: string;
}

export function MobileModelCardProgress({ progress, statusMessage, error }: MobileModelCardProgressProps) {
  return (
    <>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <span className="progress-text">{progress}%</span>
      {statusMessage && <p className="status-msg">{statusMessage}</p>}
      {error && <p className="error-message">{error}</p>}
    </>
  );
}
