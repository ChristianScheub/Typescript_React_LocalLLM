import { featureFlag_Debug_View } from '@config/featureFlags';
import { useTranslation } from 'react-i18next';
import './MobileEngineSelector.css';

interface MobileEngineSelectorProps {
  currentProvider: 'transformers' | 'webllm';
  onToggle: () => void;
}

export function MobileEngineSelector({ currentProvider, onToggle }: MobileEngineSelectorProps) {
  const { t } = useTranslation();
  const isWebllm = currentProvider === 'webllm';

  return (
    <div className="engine-selector">
      <div className={`engine-option ${isWebllm ? 'active' : ''}`}>
        <span className="engine-icon">⚡</span>
        <h3>{t('models.webllm')}</h3>
        <p>{t('models.webllmDescription')}</p>
        {isWebllm && <span className="active-badge">{t('models.active')}</span>}
      </div>

      {featureFlag_Debug_View && (
        <button 
          className="toggle-provider-btn"
          onClick={onToggle}
        >
          {t('models.switchTo', { engine: isWebllm ? 'Transformers' : 'Web-LLM' })}
        </button>
      )}
    </div>
  );
}
