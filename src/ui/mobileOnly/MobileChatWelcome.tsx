import './MobileChatWelcome.css';

interface MobileChatWelcomeProps {
  isLoading?: boolean;
}

export function MobileChatWelcome({ isLoading = false }: MobileChatWelcomeProps) {
  return (
    <div className="welcome-content">
      <div className="welcome-icon">{isLoading ? '⏳' : '✨'}</div>
      <h1>{isLoading ? 'Loading Chat...' : 'Welcome to Chris AI'}</h1>
      <p>{isLoading ? 'Please wait while we set up your chat' : 'Start a conversation with your AI assistant'}</p>
    </div>
  );
}
