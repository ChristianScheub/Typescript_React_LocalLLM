import './Input.css';

interface InputProps {
  value: string;
  onChange?: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: 'text' | 'password' | 'email' | 'number';
  className?: string;
}

export function Input({
  value,
  onChange,
  onKeyDown,
  placeholder,
  disabled = false,
  type = 'text',
  className = '',
}: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      className={`input ${className}`}
    />
  );
}
