import { useEffect } from 'react';
import type { ChatSettings } from '@types';
import { ChatSettingsContainer } from '@components/ChatSettingsContainer';
import { NeuralOscillationChart } from '@ui/NeuralOscillationChart';
import { LivePipelineLog } from '@ui/LivePipelineLog';
import { useActivityLogs } from '@hooks/useActivityLogs';
import './ContextExplorerContainer.css';

interface ContextExplorerContainerProps {
  chatSettings: ChatSettings;
  onSettingsChange: (settings: ChatSettings) => void;
}

export function ContextExplorerContainer({ chatSettings, onSettingsChange }: ContextExplorerContainerProps) {
  const { activityLogs, logCounts, logsEndRef } = useActivityLogs();

  // Auto-scroll to latest log
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activityLogs]);

  return (
    <div className="context-explorer">
      <ChatSettingsContainer settings={chatSettings} onSettingsChange={onSettingsChange} />
      <LivePipelineLog logs={activityLogs} logsEndRef={logsEndRef} />
      <NeuralOscillationChart chunkHistory={logCounts} />
    </div>
  );
}
