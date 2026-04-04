import { useTranslation } from 'react-i18next';
import './MobileChatWelcome.css';

interface MobileChatWelcomeProps {
  isLoading?: boolean;
}

export function MobileChatWelcome({ isLoading = false }: MobileChatWelcomeProps) {
  const { t } = useTranslation();

  return (
    <div className="welcome-content">
      <div className="welcome-icon">{isLoading ? '⏳' : '✨'}</div>
      <h1>{isLoading ? t('chat.loadingChat') : t('chat.welcome')}</h1>
      <p>{isLoading ? t('chat.pleaseWait') : t('chat.startConversation')}</p>
    </div>
  );
}
