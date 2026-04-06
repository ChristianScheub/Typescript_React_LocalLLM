import { useTranslation } from 'react-i18next';
import './MobileEngineSelector.css';
import { featureFlag_Debug_View } from '@config/featureFlags';

interface EngineCardProps {
  icon: string;
  nameKey: string;
  descriptionKey: string;
  isActive: boolean;
  onSelect: () => void;
}

function EngineCard({ icon, nameKey, descriptionKey, isActive, onSelect }: EngineCardProps) {
  const { t } = useTranslation();
  return (
    <div
      className={`engine-option ${isActive ? 'active' : 'inactive'}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
    >
      <span className="engine-icon">{icon}</span>
      <div className="engine-text">
        <h3>{t(nameKey)}</h3>
        <p>{t(descriptionKey)}</p>
      </div>
      {isActive && <span className="active-badge">{t('models.active')}</span>}
    </div>
  );
}

interface MobileEngineSelectorProps {
  currentProvider: 'transformers' | 'webllm';
  onToggle: () => void;
}

export function MobileEngineSelector({ currentProvider, onToggle }: MobileEngineSelectorProps) {
  const handleSelect = (target: 'webllm' | 'transformers') => {
    if (currentProvider !== target) onToggle();
  };

  return (
    <div className="engine-selector" style={{ position: 'relative' }}>
      <EngineCard
        icon="⚡"
        nameKey="models.webllm"
        descriptionKey="models.webllmDescription"
        isActive={currentProvider === 'webllm'}
        onSelect={() => handleSelect('webllm')}
      />
      {featureFlag_Debug_View && (
        <EngineCard
          icon="🤗"
          nameKey="models.transformers"
          descriptionKey="models.transformersDescription"
          isActive={currentProvider === 'transformers'}
          onSelect={() => handleSelect('transformers')}
        />
      )}
    </div>
  );
}
