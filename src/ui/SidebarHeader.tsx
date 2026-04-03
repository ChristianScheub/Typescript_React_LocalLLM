interface SidebarHeaderProps {
  logoIcon: string;
  logoText: string;
}

export function SidebarHeader({ logoIcon, logoText }: SidebarHeaderProps) {
  return (
    <div className="sidebar-header">
      <div className="logo">
        <span className="logo-icon">{logoIcon}</span>
        <span className="logo-text">{logoText}</span>
      </div>
    </div>
  );
}
