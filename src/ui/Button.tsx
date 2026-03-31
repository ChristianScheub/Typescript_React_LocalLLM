import './Button.css';

interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  className?: string;
}

export function Button({
  onClick,
  disabled = false,
  variant = 'primary',
  children,
  className = '',
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`button button-${variant} ${className}`}
    >
      {children}
    </button>
  );
}
