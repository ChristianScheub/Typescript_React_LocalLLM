interface MaxTokensInputProps {
  maxTokens: number;
  onChange: (value: number) => void;
}

export function MaxTokensInput({ maxTokens, onChange }: MaxTokensInputProps) {
  return (
    <div className="settings-group">
      <label htmlFor="max-tokens">Max Tokens</label>
      <input
        id="max-tokens"
        type="number"
        min="10"
        max="4096"
        value={maxTokens}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="number-input"
      />
      <p className="slider-hint">Maximale Länge der Antwort</p>
    </div>
  );
}
