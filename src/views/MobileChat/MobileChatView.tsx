import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChatMessage as ChatMessageType, ChatSettings } from '@types';
import { ChatMessage } from '@ui/ChatMessage';
import { Input } from '@ui/Input';
import { Button } from '@ui/Button';
import { Spinner } from '@ui/Spinner';
import { FiArrowUp, FiSettings } from 'react-icons/fi';
import { MobileChatSettingsPanel } from '@components/MobileChatSettingsPanel';
import './MobileChatView.css';

interface MobileChatViewProps {
  messages: ChatMessageType[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  error: string | null;
  currentModel: string | null;
  isModelLoaded: boolean;
  chatSettings: ChatSettings;
  onSettingsChange: (settings: ChatSettings) => void;
}

export function MobileChatView({
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
  isLoading,
  error,
  currentModel,
  isModelLoaded,
  chatSettings,
  onSettingsChange,
}: MobileChatViewProps) {
  const { t } = useTranslation();
  const [showSettings, setShowSettings] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="mobile-chat-view">
      <div className="mobile-chat-header">
        <h2 className="model-title">{currentModel || 'Chris AI'}</h2>
        <button className="settings-button" onClick={() => setShowSettings(true)}>
          <FiSettings size={20} />
        </button>
      </div>

      <div className="mobile-messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✨</div>
            <h1>{t('chat.empty.title', 'Welcome to Chris AI')}</h1>
            <p>{t('chat.empty.subtitle', 'Start a conversation with your AI assistant')}</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="loading-bubble">
                <Spinner size="small" />
              </div>
            )}
          </div>
        )}
      </div>

      {error && <div className="mobile-error-message">{error}</div>}

      <div className="mobile-input-area">
        <Input
          value={inputValue}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
          placeholder={t('chat.input.placeholder', 'Ask Chris...')}
          disabled={!isModelLoaded || isLoading}
          className="mobile-chat-input"
        />
        <Button
          onClick={onSendMessage}
          disabled={!isModelLoaded || isLoading || !inputValue.trim()}
          variant="primary"
          className="mobile-send-button"
        >
          <FiArrowUp size={16} />
        </Button>
      </div>

      <MobileChatSettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        chatSettings={chatSettings}
        onSettingsChange={onSettingsChange}
      />
    </div>
  );
}
