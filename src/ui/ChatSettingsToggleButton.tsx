import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface ChatSettingsToggleButtonProps {
  isExpanded: boolean;
  onClick: () => void;
}

export function ChatSettingsToggleButton({ isExpanded, onClick }: ChatSettingsToggleButtonProps) {
  return (
    <button
      className="settings-toggle"
      onClick={onClick}
    >
      <span className="settings-label">⚙️ Chat Settings</span>
      {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
    </button>
  );
}
