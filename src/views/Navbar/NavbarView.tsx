import './NavbarView.css';
import { useState } from 'react';
import { SettingsButton } from '../../ui/SettingsButton';
import { SettingsContainer } from '../../components/SettingsContainer';

interface NavbarViewProps {
  currentProvider: 'transformers' | 'webllm';
  onProviderChange: (provider: 'transformers' | 'webllm') => void;
}

export function NavbarView({ currentProvider, onProviderChange }: NavbarViewProps) {
  const [selectedProvider, setSelectedProvider] = useState(currentProvider);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProviderChange = (provider: 'transformers' | 'webllm') => {
    setSelectedProvider(provider);
    onProviderChange(provider);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-title">
          <h1>Local LLM Chat</h1>
        </div>

        <div className="navbar-provider-selector">
          <button
            className={`provider-btn ${selectedProvider === 'transformers' ? 'active' : ''}`}
            onClick={() => handleProviderChange('transformers')}
          >
            Transformers.js v3
          </button>
          <button
            className={`provider-btn ${selectedProvider === 'webllm' ? 'active' : ''}`}
            onClick={() => handleProviderChange('webllm')}
          >
            Web-LLM
          </button>
        </div>

        <div className="navbar-actions">
          <SettingsButton onClick={() => setIsModalOpen(true)} />
          <SettingsContainer
            provider={selectedProvider}
            onProviderChange={handleProviderChange}
            isModalOpen={isModalOpen}
            onModalClose={() => setIsModalOpen(false)}
          />
        </div>
      </div>
    </nav>
  );
}
