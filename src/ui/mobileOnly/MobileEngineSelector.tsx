import { featureFlag_Debug_View } from '@config/featureFlags';
import './MobileEngineSelector.css';

interface MobileEngineSelectorProps {
  currentProvider: 'transformers' | 'webllm';
  onToggle: () => void;
}

export function MobileEngineSelector({ currentProvider, onToggle }: MobileEngineSelectorProps) {
  const isWebllm = currentProvider === 'webllm';

  return (
    <div className="engine-selector">
      <div className={`engine-option ${isWebllm ? 'active' : ''}`}>
        <span className="engine-icon">⚡</span>
        <h3>Web-LLM</h3>
        <p>WebGPU-Beschleunigung für neuronale Inferenzen</p>
        {isWebllm && <span className="active-badge">AKTIV</span>}
      </div>

      {featureFlag_Debug_View && (
        <button 
          className="toggle-provider-btn"
          onClick={onToggle}
        >
          Zu {isWebllm ? 'Transformers' : 'Web-LLM'} wechseln
        </button>
      )}
    </div>
  );
}
