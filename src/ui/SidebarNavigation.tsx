import { FiMessageSquare, FiDatabase, FiInfo } from 'react-icons/fi';

interface SidebarNavigationProps {
  currentView: 'chat' | 'models' | 'info';
  onViewChange: (view: 'chat' | 'models' | 'info') => void;
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
        className={`nav-item ${currentView === 'info' ? 'active' : ''}`}
        onClick={() => onViewChange('info')}
      >
        <FiInfo size={20} />
        <span>App Info</span>
      </button>
    </nav>
  );
}
