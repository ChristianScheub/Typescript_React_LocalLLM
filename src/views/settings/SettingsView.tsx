import './SettingsView.css';
import '../mobileOnly/MobileModels/MobileModelsView.css';
import { FiCheck, FiDownload, FiArrowRight, FiSearch } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { featureFlag_Debug_View } from '@config/featureFlags';
import { MobileModelCard } from '@ui/mobileOnly/MobileModelCard';
import { MobileEngineSelector } from '@ui/mobileOnly/MobileEngineSelector';
import type { ModelFamily } from '@services/webllm/IWebllmService';

interface Model {
  id: string;
  name: string;
  description: string;
  size: string;
  downloaded: boolean;
  isCached?: boolean;
  family: ModelFamily;
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
  isMobile?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFamily: ModelFamily | 'All';
  onFamilyChange: (family: ModelFamily | 'All') => void;
  availableFamilies: ModelFamily[];
  maxVram: number;
  onMaxVramChange: (value: number) => void;
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
  isMobile = false,
  searchQuery,
  onSearchChange,
  activeFamily,
  onFamilyChange,
  availableFamilies,
  maxVram,
  onMaxVramChange,
}: SettingsViewProps) {
  const { t } = useTranslation();

  const handleToggleProvider = () => {
    onProviderChange(currentProvider === 'webllm' ? 'transformers' : 'webllm');
  };

  if (isMobile) {
    return (
      <div className="mobile-models-view">
        <div className="models-header">
          <h2>{t('models.engineArchitecture')}</h2>
          <p>{t('models.selectRuntime')}</p>
        </div>

        <MobileEngineSelector 
          currentProvider={currentProvider}
          onToggle={handleToggleProvider}
        />

        <div className="models-section">
          <h3>{t('models.availableModels')}</h3>
          <p className="models-subtitle">{t('models.modelsSubtitle')}</p>

          <div className="models-search-filter">
            <div className="models-search-bar">
              <FiSearch size={16} className="search-icon" />
              <input
                type="text"
                placeholder={t('models.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="models-search-input"
              />
            </div>
            <div className="models-filter-chips">
              <button
                className={`filter-chip ${activeFamily === 'All' ? 'active' : ''}`}
                onClick={() => onFamilyChange('All')}
              >
                {t('models.filterAll')}
              </button>
              {availableFamilies.map((family) => (
                <button
                  key={family}
                  className={`filter-chip ${activeFamily === family ? 'active' : ''}`}
                  onClick={() => onFamilyChange(family)}
                >
                  {family}
                </button>
              ))}
            </div>
          </div>

          <div className="vram-warning-banner" style={{ background: '#2a1f00', border: '1px solid #f5a623', borderRadius: '8px', padding: '12px 16px', marginBottom: '12px', color: '#f5a623', fontSize: '0.85rem', lineHeight: 1.5 }}>
            <strong>⚠️ {t('models.vramWarningTitle', 'Hinweis')}</strong>
            <p style={{ margin: '4px 0 0', color: '#e0d6c2' }}>
              {t('models.vramWarningText', 'Wir empfehlen Modelle mit unter 2 GB VRAM für die beste Kompatibilität. Die Unterstützung unterscheidet sich je nach Gerät und verfügbarem RAM.')}
            </p>
          </div>

          <div className="vram-filter">
            <div className="vram-filter-header">
              <span className="vram-filter-label">{t('models.vramFilter')}</span>
              <span className="vram-filter-value">{maxVram} GB</span>
            </div>
            <input
              type="range"
              min={1}
              max={16}
              step={0.5}
              value={maxVram}
              onChange={(e) => onMaxVramChange(parseFloat(e.target.value))}
              className="vram-slider"
            />
            <div className="vram-slider-labels">
              <span>{t('models.vramMin')}</span>
              <span>{t('models.vramMax')}</span>
            </div>
          </div>

          <div className="models-list">
            {models.map((model) => (
              <MobileModelCard
                key={model.id}
                name={model.name}
                description={model.description}
                size={model.size}
                isDownloaded={model.downloaded}
                isCached={model.isCached}
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

  return (
    <div className="settings-view">
      {/* Engine Architecture Section */}
      <section className="engine-section">
        <div className="section-header">
          <h2 className="section-title">{t('settings.engineArchitecture')}</h2>
          <p className="section-subtitle">
            {t('settings.selectRuntime')}
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
            <h3>{t('settings.engineCards.webllm.name')}</h3>
            <p className="engine-description">
              {t('settings.engineCards.webllm.description')}
            </p>
            {currentProvider === 'webllm' && (
              <span className="active-badge">{t('settings.engineCards.active')}</span>
            )}
            {currentProvider === 'webllm' && (
              <div className="recommendation">
                {t('settings.engineCards.webllm.recommendation')}
              </div>
            )}
          </div>

          {featureFlag_Debug_View && (
            <>
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
                <h3>{t('settings.engineCards.transformers.name')}</h3>
                <p className="engine-description">
                  {t('settings.engineCards.transformers.description')}
                </p>
                {currentProvider === 'transformers' && (
                  <span className="active-badge">{t('settings.engineCards.active')}</span>
                )}
                {currentProvider === 'transformers' && (
                  <div className="recommendation">
                    {t('settings.engineCards.transformers.recommendation')}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Available Models Section */}
      <section className="models-section">
        <div className="models-header">
          <h2 className="section-title">{t('settings.availableModels')}</h2>
          <p className="models-subtitle">{t('settings.modelsSubtitle')}</p>
          <a className="view-registry" href="https://github.com/mlc-ai/web-llm/blob/main/src/config.ts" target="_blank" rel="noopener noreferrer">
            {t('settings.viewRegistry')}
          </a>
        </div>

        <div className="models-search-filter">
          <div className="models-search-bar">
            <FiSearch size={16} className="search-icon" />
            <input
              type="text"
              placeholder={t('models.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="models-search-input"
            />
          </div>
          <div className="models-filter-chips">
            <button
              className={`filter-chip ${activeFamily === 'All' ? 'active' : ''}`}
              onClick={() => onFamilyChange('All')}
            >
              {t('models.filterAll')}
            </button>
            {availableFamilies.map((family) => (
              <button
                key={family}
                className={`filter-chip ${activeFamily === family ? 'active' : ''}`}
                onClick={() => onFamilyChange(family)}
              >
                {family}
              </button>
            ))}
          </div>
        </div>

        <div className="vram-warning-banner" style={{ background: '#2a1f00', border: '1px solid #f5a623', borderRadius: '8px', padding: '12px 16px', marginBottom: '12px', color: '#f5a623', fontSize: '0.85rem', lineHeight: 1.5 }}>
          <strong>⚠️ {t('models.vramWarningTitle', 'Hinweis')}</strong>
          <p style={{ margin: '4px 0 0', color: '#e0d6c2' }}>
            {t('models.vramWarningText', 'Wir empfehlen Modelle mit unter 2 GB VRAM für die beste Kompatibilität. Die Unterstützung unterscheidet sich je nach Gerät und verfügbarem RAM.')}
          </p>
        </div>

        <div className="vram-filter">
          <div className="vram-filter-header">
            <span className="vram-filter-label">{t('models.vramFilter')}</span>
            <span className="vram-filter-value">{maxVram} GB</span>
          </div>
          <input
            type="range"
            min={1}
            max={16}
            step={0.5}
            value={maxVram}
            onChange={(e) => onMaxVramChange(parseFloat(e.target.value))}
            className="vram-slider"
          />
          <div className="vram-slider-labels">
            <span>{t('models.vramMin')}</span>
            <span>{t('models.vramMax')}</span>
          </div>
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
                    {downloadingModel === model.id ? t('settings.models.downloading') : t('settings.models.optimized')}
                  </span>
                )}
                {!model.downloaded && model.isCached && (
                  <span className="model-badge model-badge-ready">{t('settings.models.cached', 'IM CACHE')}</span>
                )}
                {!model.downloaded && !model.isCached && !downloadingModel && (
                  <span className="model-badge model-badge-ready">{t('settings.models.ready')}</span>
                )}
                {downloadingModel === model.id && (
                  <span className="model-badge model-badge-downloading">{t('settings.models.downloading')}</span>
                )}
              </div>

              <h3 className="model-card-title">{model.name}</h3>
              <p className="model-card-subtitle">{model.description.split(' ')[0].toUpperCase()} {t('settings.models.instruct')}</p>

              <div className="model-stats">
                <div className="stat">
                  <span className="stat-label">{t('settings.models.size')}</span>
                  <span className="stat-value">{model.size}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">{t('settings.models.quant')}</span>
                  <span className="stat-value">{t('settings.models.q4_k_m')}</span>
                </div>
              </div>

              {downloadingModel === model.id ? (
                <div className="model-download-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ '--progress': `${downloadProgress}%` } as React.CSSProperties}
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
                  {model.downloaded ? t('settings.models.loaded') : model.isCached ? (
                    <>
                      <FiDownload size={16} />
                      {t('settings.models.initCached', 'INITIALISIEREN')}
                    </>
                  ) : (
                    <>
                      <FiDownload size={16} />
                      {t('settings.models.download')}
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
        <h2 className="section-title">{t('settings.architecturalDetail')}</h2>
        
        <div className="architectural-content">
          <div className="architectural-text">
            <div className="detail-item">
              <h4 className="detail-title">{t('settings.webgpuVsWasm')}</h4>
              <p className="detail-description">
                {t('settings.webgpuDescription')}
              </p>
            </div>

            <div className="detail-item">
              <h4 className="detail-title">{t('settings.localPrivacy')}</h4>
              <p className="detail-description">
                {t('settings.localPrivacyDescription')}
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
