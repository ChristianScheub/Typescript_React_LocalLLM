import { FiMessageSquare, FiLayers, FiInfo } from 'react-icons/fi';
import './MobileBottomNav.css';

interface MobileBottomNavProps {
  currentView: 'chat' | 'models' | 'info';
  onViewChange: (view: 'chat' | 'models' | 'info') => void;
}

export function MobileBottomNav({ currentView, onViewChange }: MobileBottomNavProps) {
  const navItems = [
    { id: 'chat', label: 'Chat', icon: FiMessageSquare },
    { id: 'models', label: 'Models', icon: FiLayers },
    { id: 'info', label: 'Info', icon: FiInfo },
  ] as const;

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <Icon size={24} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
