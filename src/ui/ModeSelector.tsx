interface ModeSelectorProps {
  mode: 'fast' | 'expert';
  onChange: (mode: 'fast' | 'expert') => void;
}

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div className="settings-group">
      <label className="settings-group-title">Mode</label>
      <div className="mode-buttons">
        <button
          className={`mode-button ${mode === 'fast' ? 'active' : ''}`}
          onClick={() => onChange('fast')}
        >
          ⚡ Schnell
        </button>
        <button
          className={`mode-button ${mode === 'expert' ? 'active' : ''}`}
          onClick={() => onChange('expert')}
        >
          🧠 Experte
        </button>
      </div>
      <p className="mode-description">
        {mode === 'fast'
          ? 'Kurze, prägnante Antworten (max 2 Sätze)'
          : 'Ausführliche Erklärungen mit Details und Bullet Points'}
      </p>
    </div>
  );
}
