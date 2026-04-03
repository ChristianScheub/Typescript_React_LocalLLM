import { useTranslation } from 'react-i18next';

interface PresencePenaltySliderProps {
  presencePenalty: number;
  onChange: (value: number) => void;
}

export function PresencePenaltySlider({ presencePenalty, onChange }: PresencePenaltySliderProps) {
  const { t } = useTranslation();

  return (
    <div className="settings-group">
      <div className="slider-header">
        <label htmlFor="presence-penalty">{t('chatSettings.presencePenalty')}</label>
        <span className="slider-value">{presencePenalty.toFixed(2)}</span>
      </div>
      <input
        id="presence-penalty"
        type="range"
        min="-2"
        max="2"
        step="0.1"
        value={presencePenalty}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="slider"
      />
      <p className="slider-hint">{t('chatSettings.presencePenaltyHint')}</p>
    </div>
  );
}
