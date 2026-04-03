import type { ChatSettings } from '@types';
import { ChatSettingsContainer } from '@components/ChatSettingsContainer';
import { NeuralOscillationChart } from '@ui/NeuralOscillationChart';
import { LivePipelineLog } from '@ui/LivePipelineLog';
import { FiX } from 'react-icons/fi';
import './MobileChatSettingsPanel.css';
import { useEffect, useRef, useState } from 'react';
import Logger from '@services/logger';

interface ActivityLog {
  id: string;
  timestamp: string;
  message: string;
}

interface MobileChatSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  chatSettings: ChatSettings;
  onSettingsChange: (settings: ChatSettings) => void;
}

export function MobileChatSettingsPanel({
  isOpen,
  onClose,
  chatSettings,
  onSettingsChange,
}: MobileChatSettingsPanelProps) {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [logCounts, setLogCounts] = useState<number[]>(Array(60).fill(0));
  const logsEndRef = useRef<HTMLElement>(null);
  const totalLogsRef = useRef(0);
  const lastSnapshotRef = useRef(0);

  // Auto-scroll to latest log
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activityLogs]);

  // Subscribe to Logger events
  useEffect(() => {
    const unsubscribe = Logger.subscribe((message: string) => {
      totalLogsRef.current += 1;

      const newLog: ActivityLog = {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        message: message.trim(),
      };

      setActivityLogs(prev => [...prev.slice(-15), newLog]);
    });

    return () => unsubscribe();
  }, []);

  // Every 5 seconds: push delta (new logs since last snapshot) into chart
  useEffect(() => {
    const intervalId = setInterval(() => {
      const delta = totalLogsRef.current - lastSnapshotRef.current;
      lastSnapshotRef.current = totalLogsRef.current;
      setLogCounts(prev => [...prev.slice(1), delta]);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      <div className="mobile-settings-overlay" onClick={onClose} />
      <div className="mobile-chat-settings-panel">
        <div className="panel-header">
          <h2>Chat Settings</h2>
          <button className="close-button" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <div className="panel-content">
          <ChatSettingsContainer 
            settings={chatSettings} 
            onSettingsChange={onSettingsChange}
            isMobile={true}
          />

          <div className="chart-section">
            <NeuralOscillationChart chunkHistory={logCounts} isMobile={true} />
          </div>

          <div className="live-pipeline-section">
            <LivePipelineLog logs={activityLogs} logsEndRef={logsEndRef} isMobile={true} />
          </div>
        </div>
      </div>
    </>
  );
}
