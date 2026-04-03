import { useState, useEffect, useRef } from 'react';
import type { ChatSettings } from '@types';
import { ChatSettingsContainer } from '@components/ChatSettingsContainer';
import { NeuralOscillationChart } from '@ui/NeuralOscillationChart';
import { LivePipelineLog } from '@ui/LivePipelineLog';
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
}

export function ContextExplorerContainer({ chatSettings, onSettingsChange }: ContextExplorerContainerProps) {
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

  return (
    <div className="context-explorer">
      <ChatSettingsContainer settings={chatSettings} onSettingsChange={onSettingsChange} />
      <LivePipelineLog logs={activityLogs} logsEndRef={logsEndRef} />
      <NeuralOscillationChart chunkHistory={logCounts} />
    </div>
  );
}
