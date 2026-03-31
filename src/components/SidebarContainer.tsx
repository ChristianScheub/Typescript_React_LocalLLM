import { FiMessageSquare, FiDatabase, FiSettings } from 'react-icons/fi';
import './SidebarContainer.css';

interface SidebarContainerProps {
  currentView: 'chat' | 'models' | 'settings';
  onViewChange: (view: 'chat' | 'models' | 'settings') => void;
}

export function SidebarContainer({ currentView, onViewChange }: SidebarContainerProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">The Chris</span>
        </div>
      </div>

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
    </aside>
  );
}
