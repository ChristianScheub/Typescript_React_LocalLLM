import { FiSettings } from 'react-icons/fi';

interface SettingsButtonProps {
  onClick: () => void;
  title?: string;
}

export function SettingsButton({ onClick, title = 'Settings' }: SettingsButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        color: 'white',
        fontWeight: 'bold',
        minWidth: '40px',
        minHeight: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        transition: 'background-color 0.2s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      title={title}
    >
      <FiSettings size={20} />
    </button>
  );
}
