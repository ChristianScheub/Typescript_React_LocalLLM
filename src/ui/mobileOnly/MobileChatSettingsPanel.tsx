import type { ChatSettings } from '@types';
import { ChatSettingsContainer } from '@components/ChatSettingsContainer';
import { NeuralOscillationChart } from '@ui/NeuralOscillationChart';
import { LivePipelineLog } from '@ui/LivePipelineLog';
import { FiX } from 'react-icons/fi';
import './MobileChatSettingsPanel.css';

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
  activityLogs: ActivityLog[];
  logCounts: number[];
  logsEndRef: React.MutableRefObject<HTMLElement | null>;
}

export function MobileChatSettingsPanel({
  isOpen,
  onClose,
  chatSettings,
  onSettingsChange,
  activityLogs,
  logCounts,
  logsEndRef,
}: MobileChatSettingsPanelProps) {
  return (
    <>
      <div className={`mobile-settings-overlay${isOpen ? ' open' : ''}`} onClick={onClose} />
      <div className={`mobile-chat-settings-panel${isOpen ? ' open' : ''}`}>
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
