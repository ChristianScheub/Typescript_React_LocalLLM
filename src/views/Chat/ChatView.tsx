import './ChatView.css';
import type { ChatMessage as ChatMessageType } from '../../types';
import { ChatMessage } from '../../ui/ChatMessage';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Spinner } from '../../ui/Spinner';
import { FiArrowUp, FiSearch, FiUser } from 'react-icons/fi';

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
        <div className="header-left">
          <h2>ACTIVE MODEL</h2>
          {currentModel && (
            <span className="active-model-badge">
              <span className="model-indicator"></span>
              {currentModel}
            </span>
          )}
        </div>
        <div className="header-right">
          <button className="header-icon-btn" title="Search">
            <FiSearch size={18} />
          </button>
          <button className="header-icon-btn" title="Profile">
            <FiUser size={18} />
          </button>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✨</div>
            <p>Welcome to Chris AI</p>
            <p className="empty-subtitle">Start a conversation with your AI assistant</p>
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
          placeholder="Ask Chris anything..."
          disabled={!isModelLoaded || isLoading}
          className="chat-input"
        />
        <Button
          onClick={onSendMessage}
          disabled={!isModelLoaded || isLoading || !inputValue.trim()}
          variant="primary"
          className="send-button"
        >
          <FiArrowUp size={18} />
        </Button>
      </div>
    </div>
  );
}
