import { useTranslation } from 'react-i18next';

interface ModeSelectorProps {
  mode: 'fast' | 'expert';
  onChange: (mode: 'fast' | 'expert') => void;
}

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="settings-group">
      <label className="settings-group-title">{t('chatSettings.mode')}</label>
      <div className="mode-buttons">
        <button
          className={`mode-button ${mode === 'fast' ? 'active' : ''}`}
          onClick={() => onChange('fast')}
        >
          {t('chatSettings.modeOptions.fast')}
        </button>
        <button
          className={`mode-button ${mode === 'expert' ? 'active' : ''}`}
          onClick={() => onChange('expert')}
        >
          {t('chatSettings.modeOptions.expert')}
        </button>
      </div>
      <p className="mode-description">
        {mode === 'fast'
          ? t('chatSettings.modeDescriptions.fast')
          : t('chatSettings.modeDescriptions.expert')}
      </p>
    </div>
  );
}
