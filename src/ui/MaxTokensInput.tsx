import { useTranslation } from 'react-i18next';

interface MaxTokensInputProps {
  maxTokens: number;
  onChange: (value: number) => void;
}

export function MaxTokensInput({ maxTokens, onChange }: MaxTokensInputProps) {
  const { t } = useTranslation();

  return (
    <div className="settings-group">
      <label htmlFor="max-tokens">{t('chatSettings.maxTokens')}</label>
      <input
        id="max-tokens"
        type="number"
        min="10"
        max="4096"
        value={maxTokens}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="number-input"
      />
      <p className="slider-hint">{t('chatSettings.maxTokensHint')}</p>
    </div>
  );
}
