import { useState, useEffect } from 'react';
import Logger from './services/logger';
import { ChatContainer } from './components/ChatContainer';
import { SidebarContainer } from './components/SidebarContainer';
import { ContextExplorerContainer } from './components/ContextExplorerContainer';
import { SystemStatusContainer } from './components/SystemStatusContainer';
import { ModelsContainer } from './components/ModelsContainer';
import { SettingsContainer } from './components/SettingsContainer';
import './App.css';

function App() {
  const [provider, setProvider] = useState<'transformers' | 'webllm'>('webllm');
  const [currentView, setCurrentView] = useState<'chat' | 'models' | 'settings'>('chat');

  useEffect(() => {
    Logger.infoService(`[App] Application initialized with provider: ${provider}`);
  }, []);

  const handleProviderChange = (newProvider: 'transformers' | 'webllm') => {
    Logger.infoService(`[App] Provider changed from ${provider} to ${newProvider}`);
    setProvider(newProvider);
  };

  return (
    <div className="app">
      <SidebarContainer 
        currentView={currentView} 
        onViewChange={setCurrentView}
      />
      
      <main className="app-main">
        {currentView === 'chat' && (
          <ChatContainer key={provider} provider={provider} />
        )}
        {currentView === 'models' && (
          <ModelsContainer provider={provider} onProviderChange={handleProviderChange} />
        )}
        {currentView === 'settings' && (
          <SettingsContainer provider={provider} onProviderChange={handleProviderChange} />
        )}
      </main>

      <aside className="app-context">
        <ContextExplorerContainer />
      </aside>

      <footer className="app-footer">
        <SystemStatusContainer />
      </footer>
    </div>
  );
}

export default App;
