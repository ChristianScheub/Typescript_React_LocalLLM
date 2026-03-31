import './Spinner.css';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

export function Spinner({ size = 'medium' }: SpinnerProps) {
  return (
    <div className={`spinner spinner-${size}`}>
      <div className="spinner-ring"></div>
    </div>
  );
}
