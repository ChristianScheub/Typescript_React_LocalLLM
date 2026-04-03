import { useState, useEffect, useRef } from 'react';
import type { ChatSettings } from '@types';
import { ChatSettingsContainer } from '@components/ChatSettingsContainer';
import Logger from '@services/logger';
import './ContextExplorerContainer.css';

interface ContextExplorerContainerProps {
  chatSettings: ChatSettings;
  onSettingsChange: (settings: ChatSettings) => void;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'chunk' | 'error' | 'warning';
}

export function ContextExplorerContainer({ chatSettings, onSettingsChange }: ContextExplorerContainerProps) {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [chunkHistory, setChunkHistory] = useState<number[]>(Array(60).fill(0)); // 5 mins, 5 sec intervals
  const logsEndRef = useRef<HTMLDivElement>(null);
  const chunkCounterRef = useRef(0);
  const lastChunkIntervalRef = useRef(0);

  // Auto-scroll to latest log
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activityLogs]);

  // Subscribe to Logger events
  useEffect(() => {
    lastChunkIntervalRef.current = Date.now();

    const unsubscribe = Logger.subscribe((message: string, type: 'info' | 'warning' | 'error' | 'cache') => {
      // Clean up message - just show what we got
      const cleanMessage = message.trim();
      
      // Filter out verbose logs that spam the activity monitor
      const verbosePatterns = [
        'Model.*not loaded', // Models state check logs
        'Model.*: loaded', // Model state logs
        'ModelStateManager updated',
        'getLoaded',
        'Unsubscribing',
        'Subscriber removed',
        'initialize for provider',
        'Initializing for provider',
        'Fetching models for provider', // Service calls
        'Marking model as loaded', // Model state updates
        'Provider exists', // Internal state
        'Model added.*Total loaded', // State confirmations
        'Notifying.*listeners', // Listener notifications
        'Calling listener', // Internal listener calls
        'Updated loaded models count', // State updates
        'getModelsByProvider', // Service info logs
      ];
      
      const isVerbose = verbosePatterns.some(pattern => 
        new RegExp(pattern, 'i').test(cleanMessage)
      );
      
      // Only show relevant logs, skip verbose ones
      if (isVerbose) return;
      
      // Determine log type based on message content and logger type
      let logType: ActivityLog['type'] = 'info';
      
      if (type === 'error') {
        logType = 'error';
      } else if (type === 'warning') {
        logType = 'warning';
      } else if (type === 'cache') {
        // Cache logs (includes Chunk received, progress, etc.)
        logType = 'chunk';
      } else if (cleanMessage.includes('Chunk') || cleanMessage.includes('Progress')) {
        logType = 'chunk';
      }

      const newLog: ActivityLog = {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        message: cleanMessage,
        type: logType,
      };

      setActivityLogs(prev => [...prev.slice(-15), newLog]); // Keep last 15 logs

      // Update chunk counter if this is a chunk log
      if (logType === 'chunk') {
        chunkCounterRef.current += 1;
      }

      // Update chart every 5 seconds
      const now = Date.now();
      if (now - lastChunkIntervalRef.current >= 5000) {
        setChunkHistory(prev => {
          const newHistory = [...prev.slice(1)];
          newHistory.push(chunkCounterRef.current);
          chunkCounterRef.current = 0;
          return newHistory;
        });
        lastChunkIntervalRef.current = now;
      }
    });

    return () => unsubscribe();
  }, []);

  const maxChunks = Math.max(...chunkHistory, 5);

  return (
    <div className="context-explorer">
            {/* Chat Settings Panel */}
      <ChatSettingsContainer 
        settings={chatSettings}
        onSettingsChange={onSettingsChange}
      />
      {/* Live Pipeline Log */}
      <div className="activity-section pipeline-section">
        <div className="section-header">
          <div className="section-label">LIVE PIPELINE</div>
          <div className="status-badge processing">PROCESSING</div>
        </div>

        <div className="activity-log">
          {activityLogs.length === 0 ? (
            <div className="log-empty">Waiting for activity...</div>
          ) : (
            activityLogs.map(log => (
              <div key={log.id} className={`log-entry log-${log.type}`}>
                <span className="log-time">[{log.timestamp}]</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* Neural Oscillation Chart */}
      <div className="activity-section chart-section">
        <div className="section-label">NEURAL OSCILLATION</div>
        <div className="chart-container">
          <div className="bars-wrapper">
            {chunkHistory.map((count, idx) => (
              <div
                key={idx}
                className="bar"
                style={{
                  height: `${(count / maxChunks) * 100}%`,
                  opacity: count > 0 ? 1 : 0.3,
                }}
              />
            ))}
          </div>
          <div className="chart-label">5 Minutes (5s intervals)</div>
        </div>
      </div>
    </div>
  );
}
