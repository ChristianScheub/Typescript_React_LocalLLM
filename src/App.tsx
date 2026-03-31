import { useState, useEffect } from 'react';
import Logger from './services/logger';
import { NavbarView } from './views/Navbar/NavbarView';
import { ChatContainer } from './components/ChatContainer';

function App() {
  const [provider, setProvider] = useState<'transformers' | 'webllm'>('transformers');

  useEffect(() => {
    Logger.infoService(`[App] Application initialized with provider: ${provider}`);
  }, []);

  const handleProviderChange = (newProvider: 'transformers' | 'webllm') => {
    Logger.infoService(`[App] Provider changed from ${provider} to ${newProvider}`);
    setProvider(newProvider);
  };

  return (
    <div className="app">
      <NavbarView 
        currentProvider={provider} 
        onProviderChange={handleProviderChange}
      />
      <main className="app-main">
        <ChatContainer key={provider} provider={provider} />
      </main>
    </div>
  );
}

export default App;
