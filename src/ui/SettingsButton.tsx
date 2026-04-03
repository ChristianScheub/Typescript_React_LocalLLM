import { FiSettings } from 'react-icons/fi';
import './SettingsButton.css';

interface SettingsButtonProps {
  onClick: () => void;
  title?: string;
}

export function SettingsButton({ onClick, title = 'Settings' }: SettingsButtonProps) {
  return (
    <button
      onClick={onClick}
      className="settings-button"
      title={title}
    >
      <FiSettings size={20} />
    </button>
  );
}
