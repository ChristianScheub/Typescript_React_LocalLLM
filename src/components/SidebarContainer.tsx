import { SidebarView } from '../views/Sidebar/SidebarView';

interface SidebarContainerProps {
  currentView: 'chat' | 'models' | 'settings';
  onViewChange: (view: 'chat' | 'models' | 'settings') => void;
}

export function SidebarContainer({ currentView, onViewChange }: SidebarContainerProps) {
  return (
    <SidebarView currentView={currentView} onViewChange={onViewChange} />
  );
}
