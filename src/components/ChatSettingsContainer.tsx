import './ChatSettingsContainer.css';
import type { ChatSettings } from '../types';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useState } from 'react';

interface ChatSettingsContainerProps {
  settings: ChatSettings;
  onSettingsChange: (settings: ChatSettings) => void;
}

export function ChatSettingsContainer({ settings, onSettingsChange }: ChatSettingsContainerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTemperatureChange = (value: number) => {
    onSettingsChange({
      ...settings,
      temperature: value,
    });
  };

  const handleMaxTokensChange = (value: number) => {
    onSettingsChange({
      ...settings,
      maxTokens: value,
    });
  };

  const handlePresencePenaltyChange = (value: number) => {
    onSettingsChange({
      ...settings,
      presencePenalty: value,
    });
  };

  const handleModeChange = (mode: 'fast' | 'expert') => {
    onSettingsChange({
      ...settings,
      mode,
    });
  };

  return (
    <div className="chat-settings-panel">
      <button
        className="settings-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="settings-label">⚙️ Chat Settings</span>
        {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
      </button>

      {isExpanded && (
        <div className="settings-content">
          {/* Mode Selection */}
          <div className="settings-group">
            <label className="settings-group-title">Mode</label>
            <div className="mode-buttons">
              <button
                className={`mode-button ${settings.mode === 'fast' ? 'active' : ''}`}
                onClick={() => handleModeChange('fast')}
              >
                ⚡ Schnell
              </button>
              <button
                className={`mode-button ${settings.mode === 'expert' ? 'active' : ''}`}
                onClick={() => handleModeChange('expert')}
              >
                🧠 Experte
              </button>
            </div>
            <p className="mode-description">
              {settings.mode === 'fast'
                ? 'Kurze, prägnante Antworten (max 2 Sätze)'
                : 'Ausführliche Erklärungen mit Details und Bullet Points'}
            </p>
          </div>

          {/* Temperature Slider */}
          <div className="settings-group">
            <div className="slider-header">
              <label htmlFor="temperature">Temperatur</label>
              <span className="slider-value">{settings.temperature.toFixed(2)}</span>
            </div>
            <input
              id="temperature"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => handleTemperatureChange(parseFloat(e.target.value))}
              className="slider"
            />
            <p className="slider-hint">Kleinere Werte = präzisere, größere Werte = kreativere Antworten</p>
          </div>

          {/* Max Tokens Input */}
          <div className="settings-group">
            <label htmlFor="max-tokens">Max Tokens</label>
            <input
              id="max-tokens"
              type="number"
              min="10"
              max="4096"
              value={settings.maxTokens}
              onChange={(e) => handleMaxTokensChange(parseInt(e.target.value))}
              className="number-input"
            />
            <p className="slider-hint">Maximale Länge der Antwort</p>
          </div>

          {/* Presence Penalty Input */}
          <div className="settings-group">
            <div className="slider-header">
              <label htmlFor="presence-penalty">Presence Penalty</label>
              <span className="slider-value">{settings.presencePenalty.toFixed(2)}</span>
            </div>
            <input
              id="presence-penalty"
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={settings.presencePenalty}
              onChange={(e) => handlePresencePenaltyChange(parseFloat(e.target.value))}
              className="slider"
            />
            <p className="slider-hint">Negative Werte = mehr Wiederholungen, positive Werte = mehr Vielfalt</p>
          </div>
        </div>
      )}
    </div>
  );
}
