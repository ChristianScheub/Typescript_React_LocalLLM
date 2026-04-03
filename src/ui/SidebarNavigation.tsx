import { FiMessageSquare, FiDatabase, FiSettings } from 'react-icons/fi';

interface SidebarNavigationProps {
  currentView: 'chat' | 'models' | 'settings';
  onViewChange: (view: 'chat' | 'models' | 'settings') => void;
}

export function SidebarNavigation({ currentView, onViewChange }: SidebarNavigationProps) {
  return (
    <nav className="sidebar-nav">
      <button
        className={`nav-item ${currentView === 'chat' ? 'active' : ''}`}
        onClick={() => onViewChange('chat')}
      >
        <FiMessageSquare size={20} />
        <span>Chat</span>
      </button>

      <button
        className={`nav-item ${currentView === 'models' ? 'active' : ''}`}
        onClick={() => onViewChange('models')}
      >
        <FiDatabase size={20} />
        <span>Models</span>
      </button>

      <button
        className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
        onClick={() => onViewChange('settings')}
      >
        <FiSettings size={20} />
        <span>Settings</span>
      </button>
    </nav>
  );
}
