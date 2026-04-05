import { useState, useEffect } from 'react';
import type { ChatSettings } from '@types';
import Logger from '@services/logger';
import { statusBarService } from '@services/statusBar';
import { useDevicePlatform } from './hooks/useDevicePlatform';
import { ChatContainer } from '@components/ChatContainer';
import { SidebarContainer } from '@components/SidebarContainer';
import { ContextExplorerContainer } from '@components/ContextExplorerContainer';
import { ModelsContainer } from '@components/ModelsContainer';
import { SettingsContainer } from '@components/SettingsContainer';
import { SidebarNavigation } from '@ui/SidebarNavigation';
import './App.css';

function App() {
  const deviceInfo = useDevicePlatform();
  const isIPhone = /iPhone/i.test(navigator.userAgent);
  const [provider, setProvider] = useState<'transformers' | 'webllm'>('webllm');
  const [currentView, setCurrentView] = useState<'chat' | 'models' | 'info'>('chat');
  const [chatSettings, setChatSettings] = useState<ChatSettings>({
    temperature: 0.7,
    maxTokens: 1024,
    presencePenalty: 0,
    mode: 'expert',
  });

  useEffect(() => {
    statusBarService.configureStatusBar();
    Logger.infoService(`[App] Application initialized with provider: ${provider} on platform: ${deviceInfo.platform}`);
  }, [provider, deviceInfo.platform]);

  const handleProviderChange = (newProvider: 'transformers' | 'webllm') => {
    Logger.infoService(`[App] Provider changed from ${provider} to ${newProvider}`);
    setProvider(newProvider);
  };

  const handleSettingsChange = (settings: ChatSettings) => {
    Logger.infoService(`[App] Chat settings updated`);
    setChatSettings(settings);
  };

  // Mobile Layout
  if (deviceInfo.isMobile) {
    return (
      <div className="app-mobile" style={isIPhone ? { paddingTop: '3vh' } : undefined}>
        <main className="mobile-main">
          {currentView === 'chat' && (
            <ChatContainer key={provider} provider={provider} chatSettings={chatSettings} onSettingsChange={handleSettingsChange} />
          )}
          {currentView === 'models' && (
            <ModelsContainer provider={provider} onProviderChange={handleProviderChange} />
          )}
          {currentView === 'info' && (
            <SettingsContainer />
          )}
        </main>
        <SidebarNavigation currentView={currentView} onViewChange={setCurrentView} isMobile={true} />
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="app" style={isIPhone ? { marginTop: '10vh' } : undefined}>
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
        {currentView === 'info' && (
          <SettingsContainer />
        )}
      </main>

      <aside className="app-context">
        <ContextExplorerContainer chatSettings={chatSettings} onSettingsChange={handleSettingsChange} />
      </aside>
    </div>
  );
}

export default App;
