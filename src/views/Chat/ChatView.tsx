import './ChatView.css';
import type { ChatMessage as ChatMessageType } from '../../types';
import { ChatMessage } from '../../ui/ChatMessage';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Spinner } from '../../ui/Spinner';

interface ChatViewProps {
  messages: ChatMessageType[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  error: string | null;
  currentModel: string | null;
  isModelLoaded: boolean;
  provider: 'transformers' | 'webllm';
}

export function ChatView({
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
  isLoading,
  error,
  currentModel,
  isModelLoaded,
  provider,
}: ChatViewProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>{provider === 'transformers' ? 'Transformers.js' : 'Web-LLM'}</h2>
        <p className="model-info">
          {isModelLoaded ? (
            <>
              <span className="status-badge status-active">Active</span> Model loaded: <strong>{currentModel}</strong>
            </>
          ) : (
            <>
              <span className="status-badge status-inactive">Inactive</span> No model loaded. Download one in settings.
            </>
          )}
        </p>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>No messages yet. Download a model and start chatting!</p>
          </div>
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}
        {isLoading && (
          <div className="loading-state">
            <Spinner size="medium" />
            <p>Generating response...</p>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="chat-input-area">
        <Input
          value={inputValue}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Shift+Enter for new line)"
          disabled={!isModelLoaded || isLoading}
          className="chat-input"
        />
        <Button
          onClick={onSendMessage}
          disabled={!isModelLoaded || isLoading || !inputValue.trim()}
          variant="primary"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
}
