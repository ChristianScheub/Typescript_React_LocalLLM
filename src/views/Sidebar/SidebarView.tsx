import './SidebarView.css';
import { SidebarHeader } from '@ui/SidebarHeader';
import { SidebarNavigation } from '@ui/SidebarNavigation';

interface SidebarViewProps {
  currentView: 'chat' | 'models' | 'info';
  onViewChange: (view: 'chat' | 'models' | 'info') => void;
}

export function SidebarView({ currentView, onViewChange }: SidebarViewProps) {
  return (
    <aside className="sidebar">
      <SidebarHeader logoIcon="⚡" logoText="The Chris" />
      <SidebarNavigation currentView={currentView} onViewChange={onViewChange} />
    </aside>
  );
}
