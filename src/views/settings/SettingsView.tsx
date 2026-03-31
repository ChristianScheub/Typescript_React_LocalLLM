import './SettingsView.css';
import { FiCheck, FiDownload, FiArrowRight } from 'react-icons/fi';

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
  statusMessage?: string | null;
}

export function SettingsView({
  currentProvider,
  onProviderChange,
  models,
  downloadingModel,
  downloadProgress,
  onDownload,
  error,
  statusMessage,
}: SettingsViewProps) {
  return (
    <div className="settings-view">
      {/* Engine Architecture Section */}
      <section className="engine-section">
        <div className="section-header">
          <h2 className="section-title">Engine Architecture</h2>
          <p className="section-subtitle">
            Select the runtime environment that best fits your hardware. Chris AI dynamically
            manages resources to ensure optimal inference speeds.
          </p>
        </div>

        <div className="engine-cards">
          <div
            className={`engine-card ${currentProvider === 'webllm' ? 'active' : ''}`}
            onClick={() => onProviderChange('webllm')}
          >
            {currentProvider === 'webllm' && (
              <div className="card-badge">
                <FiCheck size={20} />
              </div>
            )}
            <div className="engine-icon">
              <div className="icon-circle">⚡</div>
            </div>
            <h3>Web-LLM</h3>
            <p className="engine-description">
              Native WebGPU acceleration for high-performance neural inference directly in the browser.
            </p>
            {currentProvider === 'webllm' && (
              <span className="active-badge">ACTIVE</span>
            )}
            {currentProvider === 'webllm' && (
              <div className="recommendation">
                Recommended for M1/M2/M3 & RTX Series
              </div>
            )}
          </div>

          <div className="engine-divider">
            <span className="divider-text">
              <FiArrowRight size={16} />
            </span>
          </div>

          <div
            className={`engine-card ${currentProvider === 'transformers' ? 'active' : ''}`}
            onClick={() => onProviderChange('transformers')}
          >
            {currentProvider === 'transformers' && (
              <div className="card-badge">
                <FiCheck size={20} />
              </div>
            )}
            <div className="engine-icon">
              <div className="icon-circle">⚙</div>
            </div>
            <h3>Transformers v3 - NOT WORKING</h3>
            <p className="engine-description">
              Max compatibility runtime using WASM kernels. Ideal for legacy systems and diverse environments.
            </p>
            {currentProvider === 'transformers' && (
              <span className="active-badge">ACTIVE</span>
            )}
            {currentProvider === 'transformers' && (
              <div className="recommendation">
                CPU-Optimized Fallback
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Available Models Section */}
      <section className="models-section">
        <div className="models-header">
          <h2 className="section-title">Available Models</h2>
          <p className="models-subtitle">Library of weights compatible with your current engine.</p>
          <a className="view-registry" href="https://github.com/mlc-ai/web-llm/blob/main/src/config.ts" target="_blank" rel="noopener noreferrer">
            View Registry
          </a>
        </div>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        <div className="models-grid">
          {models.map((model) => (
            <div key={model.id} className="model-card">
              <div className="model-card-header">
                {model.downloaded && (
                  <span className="model-badge model-badge-optimized">
                    {downloadingModel === model.id ? 'DOWNLOADING' : 'OPTIMIZED'}
                  </span>
                )}
                {!model.downloaded && !downloadingModel && (
                  <span className="model-badge model-badge-ready">READY</span>
                )}
                {downloadingModel === model.id && (
                  <span className="model-badge model-badge-downloading">DOWNLOADING</span>
                )}
              </div>

              <h3 className="model-card-title">{model.name}</h3>
              <p className="model-card-subtitle">{model.description.split(' ')[0].toUpperCase()} INSTRUCT</p>

              <div className="model-stats">
                <div className="stat">
                  <span className="stat-label">Size</span>
                  <span className="stat-value">{model.size}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Quant</span>
                  <span className="stat-value">Q4_K_M</span>
                </div>
              </div>

              {downloadingModel === model.id ? (
                <div className="model-download-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${downloadProgress}%` }}
                    ></div>
                  </div>
                  <div className="progress-status">
                    <div className="progress-label">{downloadProgress}%</div>
                    {statusMessage && (
                      <div className="status-message">{statusMessage}</div>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  className={`model-action-btn ${model.downloaded ? 'loaded' : 'download'}`}
                  onClick={() => !model.downloaded && onDownload(model.id)}
                  disabled={downloadingModel !== null}
                >
                  {model.downloaded ? 'LOADED' : (
                    <>
                      <FiDownload size={16} />
                      DOWNLOAD
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Architectural Detail Section */}
      <section className="architectural-section">
        <h2 className="section-title">Architectural Detail</h2>
        
        <div className="architectural-content">
          <div className="architectural-text">
            <div className="detail-item">
              <h4 className="detail-title">WEBGPU vs WASM</h4>
              <p className="detail-description">
                Web-LLM utilizes the emerging <strong>WebGPU API++</strong>, which allows the interface to
                bypass standard browser overhead and communicate directly with your
                device's graphics card. This results in up to 10x faster token generation
                compared to traditional WASM implementations.
              </p>
            </div>

            <div className="detail-item">
              <h4 className="detail-title">LOCAL PRIVACY</h4>
              <p className="detail-description">
                All data remains on your machine. Both engines execute entirely within your
                browser's sandbox environment, ensuring that your prompts and private model
                weights remain strictly local to your hardware.
              </p>
            </div>
          </div>

          <div className="architectural-visual">
            <div className="visual-placeholder">
              <div className="visual-gradient"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
