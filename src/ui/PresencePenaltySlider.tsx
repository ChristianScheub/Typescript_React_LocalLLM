interface PresencePenaltySliderProps {
  presencePenalty: number;
  onChange: (value: number) => void;
}

export function PresencePenaltySlider({ presencePenalty, onChange }: PresencePenaltySliderProps) {
  return (
    <div className="settings-group">
      <div className="slider-header">
        <label htmlFor="presence-penalty">Presence Penalty</label>
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
      <p className="slider-hint">Negative Werte = mehr Wiederholungen, positive Werte = mehr Vielfalt</p>
    </div>
  );
}
