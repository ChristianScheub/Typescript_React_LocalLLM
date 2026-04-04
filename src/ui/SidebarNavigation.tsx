import { FiMessageSquare, FiDatabase, FiLayers, FiInfo } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import './mobileOnly/MobileBottomNav.css';

interface SidebarNavigationProps {
  currentView: 'chat' | 'models' | 'info';
  onViewChange: (view: 'chat' | 'models' | 'info') => void;
  isMobile?: boolean;
}

export function SidebarNavigation({ currentView, onViewChange, isMobile = false }: SidebarNavigationProps) {
  const { t } = useTranslation();

  const navItems = [
    { id: 'chat' as const, label: t('sidebar.chat'), icon: FiMessageSquare },
    { id: 'models' as const, label: t('sidebar.models'), icon: isMobile ? FiLayers : FiDatabase },
    { id: 'info' as const, label: t('sidebar.appInfo'), icon: FiInfo },
  ];

  return (
    <nav className={isMobile ? 'mobile-bottom-nav' : 'sidebar-nav'}>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <Icon size={isMobile ? 24 : 20} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
