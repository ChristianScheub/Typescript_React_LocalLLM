import './ChatMessage.css';
import type { ChatMessage as ChatMessageType } from '@types';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface ChatMessageProps {
  message: ChatMessageType;
}

function renderFormattedMessage(text: string): ReactNode[] {
  const { t } = useTranslation();
  const lines = text.split(/\r?\n/);
  return lines.map((line, idx) => {
    if (/^# (.*)/.test(line)) return <h1 key={idx}>{line.replace(/^# /, "")}</h1>;
    if (/^## (.*)/.test(line)) return <h2 key={idx}>{line.replace(/^## /, "")}</h2>;
    if (/^### (.*)/.test(line)) return <h3 key={idx}>{line.replace(/^### /, "")}</h3>;
    if (/^#### (.*)/.test(line)) return <h4 key={idx}>{line.replace(/^#### /, "")}</h4>;
    let formatted = line.replace(/陇(.*?)<\/think>/g, (_, c) => `<i>${c}</i>`);
    const boldOpen = t('chat.boldOpen', '<b>');
    const boldClose = t('chat.boldClose', '</b>');
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, boldOpen + '$1' + boldClose);
    return <span key={idx} dangerouslySetInnerHTML={{ __html: formatted }} />;
  });
}

function ChatMessageContent({ content }: { content: string }) {
  return <>{renderFormattedMessage(content)}</>;
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={`chat-message chat-message-${message.role}`}>
      <ChatMessageContent content={message.content} />
      <div className="chat-message-time">
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  );
}
