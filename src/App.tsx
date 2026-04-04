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
import { MobileChatContainer } from '@components/mobileOnly/MobileChatContainer';
import { MobileModelsContainer } from '@components/mobileOnly/MobileModelsContainer';
import { MobileSettingsContainer } from '@components/mobileOnly/MobileSettingsContainer';
import { MobileBottomNav } from '@ui/mobileOnly/MobileBottomNav';
import './App.css';

function App() {
  const deviceInfo = useDevicePlatform();
  const [provider, setProvider] = useState<'transformers' | 'webllm'>('webllm');
  const [currentView, setCurrentView] = useState<'chat' | 'models' | 'info'>('chat');
  const [chatSettings, setChatSettings] = useState<ChatSettings>({
    temperature: 0.7,
    maxTokens: 200,
    presencePenalty: 0,
    mode: 'fast',
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
      <div className="app-mobile">
        <main className="mobile-main">
          {currentView === 'chat' && (
            <MobileChatContainer key={provider} provider={provider} chatSettings={chatSettings} onSettingsChange={handleSettingsChange} />
          )}
          {currentView === 'models' && (
            <MobileModelsContainer provider={provider} onProviderChange={handleProviderChange} />
          )}
          {currentView === 'info' && (
            <MobileSettingsContainer />
          )}
        </main>
        <MobileBottomNav currentView={currentView} onViewChange={setCurrentView} />
      </div>
    );
  }

  // Desktop Layout
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
        {currentView === 'info' && (
          <SettingsContainer 
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
