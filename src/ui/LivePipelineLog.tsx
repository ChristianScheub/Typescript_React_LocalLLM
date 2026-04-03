import React from 'react';

interface ActivityLog {
  id: string;
  timestamp: string;
  message: string;
}

interface LivePipelineLogProps {
  logs: ActivityLog[];
  logsEndRef: React.RefObject<HTMLElement | null>;
  isMobile?: boolean;
}

export function LivePipelineLog({ logs, logsEndRef, isMobile = false }: LivePipelineLogProps) {
  return (
    <div className={`activity-section pipeline-section ${isMobile ? 'mobile' : ''}`}>
      <header className="section-header">
        <strong className="section-label">LIVE PIPELINE</strong>
        <mark className="status-badge processing">PROCESSING</mark>
      </header>
      <div className="activity-log">
        <ul>
          {logs.length === 0 ? (
            <li className="log-empty">Waiting for activity...</li>
          ) : (
            logs.map(log => (
              <li key={log.id} className="log-entry">
                <span className="log-time">[{log.timestamp}]</span>
                <span className="log-message">{log.message}</span>
              </li>
            ))
          )}
        </ul>
        <span ref={logsEndRef} />
      </div>
    </div>
  );
}
