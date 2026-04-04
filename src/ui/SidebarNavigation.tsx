import { FiMessageSquare, FiDatabase, FiInfo } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

interface SidebarNavigationProps {
  currentView: 'chat' | 'models' | 'info';
  onViewChange: (view: 'chat' | 'models' | 'info') => void;
}

export function SidebarNavigation({ currentView, onViewChange }: SidebarNavigationProps) {
  const { t } = useTranslation();

  return (
    <nav className="sidebar-nav">
      <button
        className={`nav-item ${currentView === 'chat' ? 'active' : ''}`}
        onClick={() => onViewChange('chat')}
      >
        <FiMessageSquare size={20} />
        <span>{t('sidebar.chat')}</span>
      </button>

      <button
        className={`nav-item ${currentView === 'models' ? 'active' : ''}`}
        onClick={() => onViewChange('models')}
      >
        <FiDatabase size={20} />
        <span>{t('sidebar.models')}</span>
      </button>

      <button
        className={`nav-item ${currentView === 'info' ? 'active' : ''}`}
        onClick={() => onViewChange('info')}
      >
        <FiInfo size={20} />
        <span>{t('sidebar.appInfo')}</span>
      </button>
    </nav>
  );
}
