import '../../components/SidebarContainer.css';
import { SidebarHeader } from '@ui/SidebarHeader';
import { SidebarNavigation } from '@ui/SidebarNavigation';

interface SidebarViewProps {
  currentView: 'chat' | 'models' | 'settings';
  onViewChange: (view: 'chat' | 'models' | 'settings') => void;
}

export function SidebarView({ currentView, onViewChange }: SidebarViewProps) {
  return (
    <aside className="sidebar">
      <SidebarHeader logoIcon="⚡" logoText="The Chris" />
      <SidebarNavigation currentView={currentView} onViewChange={onViewChange} />
    </aside>
  );
}
