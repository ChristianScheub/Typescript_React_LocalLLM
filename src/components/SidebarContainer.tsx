import { SidebarView } from '@views/Sidebar/SidebarView';

interface SidebarContainerProps {
  currentView: 'chat' | 'models' | 'info';
  onViewChange: (view: 'chat' | 'models' | 'info') => void;
}

export function SidebarContainer({ currentView, onViewChange }: SidebarContainerProps) {
  return (
    <SidebarView currentView={currentView} onViewChange={onViewChange} />
  );
}
