import { useState, useEffect } from 'react';
import type { ChatSettings } from '@types';
import Logger from '@services/logger';
import { ChatContainer } from '@components/ChatContainer';
import { SidebarContainer } from '@components/SidebarContainer';
import { ContextExplorerContainer } from '@components/ContextExplorerContainer';
import { ModelsContainer } from '@components/ModelsContainer';
import { SettingsContainer } from '@components/SettingsContainer';
import './App.css';

function App() {
  const [provider, setProvider] = useState<'transformers' | 'webllm'>('webllm');
  const [currentView, setCurrentView] = useState<'chat' | 'models' | 'settings'>('chat');
  const [chatSettings, setChatSettings] = useState<ChatSettings>({
    temperature: 0.7,
    maxTokens: 200,
    presencePenalty: 0,
    mode: 'fast',
  });

  useEffect(() => {
    Logger.infoService(`[App] Application initialized with provider: ${provider}`);
  }, [provider]);

  const handleProviderChange = (newProvider: 'transformers' | 'webllm') => {
    Logger.infoService(`[App] Provider changed from ${provider} to ${newProvider}`);
    setProvider(newProvider);
  };

  const handleSettingsChange = (settings: ChatSettings) => {
    Logger.infoService(`[App] Chat settings updated`);
    setChatSettings(settings);
  };

  return (
    <div className="app">
      <SidebarContainer 
        currentView={currentView} 
        onViewChange={setCurrentView}
      />
      
      <main className="app-main">
        {currentView === 'chat' && (
          <ChatContainer key={provider} provider={provider} chatSettings={chatSettings} />
        )}
        {currentView === 'models' && (
          <ModelsContainer provider={provider} onProviderChange={handleProviderChange} />
        )}
        {currentView === 'settings' && (
          <SettingsContainer 
            provider={provider} 
            onProviderChange={handleProviderChange}
            isModalOpen={true}
            onModalClose={() => setCurrentView('chat')}
          />
        )}
      </main>

      <aside className="app-context">
        <ContextExplorerContainer chatSettings={chatSettings} onSettingsChange={handleSettingsChange} />
      </aside>
    </div>
  );
}

export default App;
