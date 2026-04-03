import type { ReactNode } from 'react';
import './MobileSettingItem.css';

interface MobileSettingItemProps {
  icon: ReactNode;
  title: string;
  description: string;
  isDanger?: boolean;
  onClick: () => void;
}

export function MobileSettingItem({
  icon,
  title,
  description,
  isDanger = false,
  onClick,
}: MobileSettingItemProps) {
  return (
    <button
      className={`setting-item ${isDanger ? 'danger' : ''}`}
      onClick={onClick}
    >
      <div className={`item-icon ${isDanger ? 'danger' : ''}`}>
        {icon}
      </div>
      <div className="item-content">
        <h3 className={isDanger ? 'danger-title' : ''}>{title}</h3>
        <p>{description}</p>
      </div>
      <span className="item-arrow">›</span>
    </button>
  );
}
