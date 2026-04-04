import type { ChatSettings } from '@types';
import { MobileChatSettingsPanel } from '@ui/mobileOnly/MobileChatSettingsPanel';
import { useActivityLogs } from '@hooks/useActivityLogs';

interface MobileChatSettingsPanelContainerProps {
  isOpen: boolean;
  onClose: () => void;
  chatSettings: ChatSettings;
  onSettingsChange: (settings: ChatSettings) => void;
}

export function MobileChatSettingsPanelContainer({
  isOpen,
  onClose,
  chatSettings,
  onSettingsChange,
}: MobileChatSettingsPanelContainerProps) {
  const { activityLogs, logCounts, logsEndRef } = useActivityLogs();

  return (
    <MobileChatSettingsPanel
      isOpen={isOpen}
      onClose={onClose}
      chatSettings={chatSettings}
      onSettingsChange={onSettingsChange}
      activityLogs={activityLogs}
      logCounts={logCounts}
      logsEndRef={logsEndRef}
    />
  );
}
