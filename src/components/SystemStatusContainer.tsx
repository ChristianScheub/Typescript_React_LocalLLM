import { FiCpu } from 'react-icons/fi';
import './SystemStatusContainer.css';

interface SystemStatusContainerProps {
  provider?: 'transformers' | 'webllm';
}

export function SystemStatusContainer({ provider: _ }: SystemStatusContainerProps) {
  return (
    <div className="system-status">
      <div className="status-left">
        <button className="status-button">
          <FiCpu size={16} />
          <span className="status-label">SYSTEM STATUS</span>
        </button>
      </div>

      <div className="status-metrics">
        <div className="metric">
          <span className="metric-label">CPU Usage</span>
          <div className="metric-bar">
            <div className="metric-fill" style={{ width: '12%' }}></div>
          </div>
          <span className="metric-value">12%</span>
        </div>
      </div>

      <div className="status-right">
        <span className="status-info">
          LOCAL EXECUTION • Chris ENGINE 2.0 
        </span>
      </div>
    </div>
  );
}
