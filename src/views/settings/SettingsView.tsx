import './SettingsView.css';
import { Button } from '../../ui/Button';
import { Spinner } from '../../ui/Spinner';

interface Model {
  id: string;
  name: string;
  description: string;
  size: string;
  downloaded: boolean;
}

interface SettingsViewProps {
  currentProvider: 'transformers' | 'webllm';
  onProviderChange: (provider: 'transformers' | 'webllm') => void;
  models: Model[];
  downloadingModel: string | null;
  downloadProgress: number;
  onDownload: (modelId: string) => void;
  error: string | null;
}

export function SettingsView({
  currentProvider,
  onProviderChange,
  models,
  downloadingModel,
  downloadProgress,
  onDownload,
  error,
}: SettingsViewProps) {
  return (
    <div className="settings-view">
      <div className="settings-section">
        <h3>LLM Provider</h3>
        <p className="section-description">Choose your preferred LLM provider</p>

        <div className="provider-options">
          <label className="provider-option">
            <input
              type="radio"
              name="provider"
              value="transformers"
              checked={currentProvider === 'transformers'}
              onChange={() => onProviderChange('transformers')}
            />
            <span className="provider-label">
              <strong>Transformers.js v3</strong>
              <p>WebGPU + ONNX Runtime support</p>
            </span>
          </label>

          <label className="provider-option">
            <input
              type="radio"
              name="provider"
              value="webllm"
              checked={currentProvider === 'webllm'}
              onChange={() => onProviderChange('webllm')}
            />
            <span className="provider-label">
              <strong>Web-LLM</strong>
              <p>MLC-AI powered inference</p>
            </span>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3>Model Management</h3>
        <p className="section-description">Download and manage your models</p>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        <div className="models-list">
          {models.map((model) => (
            <div key={model.id} className="model-item">
              <div className="model-info">
                <h4>{model.name}</h4>
                <p className="model-description">{model.description}</p>
                <p className="model-size">Size: {model.size}</p>
              </div>

              {downloadingModel === model.id ? (
                <div className="download-progress">
                  <Spinner size="small" />
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${downloadProgress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{downloadProgress}%</span>
                </div>
              ) : (
                <Button
                  onClick={() => onDownload(model.id)}
                  variant="primary"
                  disabled={downloadingModel !== null}
                >
                  {model.downloaded ? 'Loaded' : 'Download'}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
