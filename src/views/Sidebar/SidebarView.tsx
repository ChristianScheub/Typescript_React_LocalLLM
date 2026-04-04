import './SidebarView.css';
import { SidebarHeader } from '@ui/SidebarHeader';
import { SidebarNavigation } from '@ui/SidebarNavigation';
import { useTranslation } from 'react-i18next';

interface SidebarViewProps {
  currentView: 'chat' | 'models' | 'info';
  onViewChange: (view: 'chat' | 'models' | 'info') => void;
}

export function SidebarView({ currentView, onViewChange }: SidebarViewProps) {
  const { t } = useTranslation();

  return (
    <aside className="sidebar">
      <SidebarHeader logoIcon="⚡" logoText={t('sidebar.logoText')} />
      <SidebarNavigation currentView={currentView} onViewChange={onViewChange} />
    </aside>
  );
}
