import '../../components/ChatSettingsContainer.css';
import type { ChatSettings } from '@types';
import { ChatSettingsToggleButton } from '@ui/ChatSettingsToggleButton';
import { ChatSettingsPanel } from '@ui/ChatSettingsPanel';

interface ChatSettingsViewProps {
  settings: ChatSettings;
  isExpanded: boolean;
  onToggleExpand?: () => void;
  onTemperatureChange: (value: number) => void;
  onMaxTokensChange: (value: number) => void;
  onPresencePenaltyChange: (value: number) => void;
  onModeChange: (mode: 'fast' | 'expert') => void;
  isMobile?: boolean;
}

export function ChatSettingsView({
  settings,
  isExpanded,
  onToggleExpand,
  onTemperatureChange,
  onMaxTokensChange,
  onPresencePenaltyChange,
  onModeChange,
  isMobile = false,
}: ChatSettingsViewProps) {
  return (
    <div className={`chat-settings-panel ${isMobile ? 'mobile' : ''}`}>
      {!isMobile && onToggleExpand && (
        <ChatSettingsToggleButton 
          isExpanded={isExpanded} 
          onClick={onToggleExpand}
        />
      )}
      <ChatSettingsPanel
        settings={settings}
        isExpanded={isExpanded || isMobile}
        onTemperatureChange={onTemperatureChange}
        onMaxTokensChange={onMaxTokensChange}
        onPresencePenaltyChange={onPresencePenaltyChange}
        onModeChange={onModeChange}
      />
    </div>
  );
}
