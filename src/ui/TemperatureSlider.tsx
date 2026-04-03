import { useTranslation } from 'react-i18next';

interface TemperatureSliderProps {
  temperature: number;
  onChange: (value: number) => void;
}

export function TemperatureSlider({ temperature, onChange }: TemperatureSliderProps) {
  const { t } = useTranslation();

  return (
    <div className="settings-group">
      <div className="slider-header">
        <label htmlFor="temperature">{t('chatSettings.temperature')}</label>
        <span className="slider-value">{temperature.toFixed(2)}</span>
      </div>
      <input
        id="temperature"
        type="range"
        min="0"
        max="2"
        step="0.1"
        value={temperature}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="slider"
      />
      <p className="slider-hint">{t('chatSettings.temperatureHint')}</p>
    </div>
  );
}
