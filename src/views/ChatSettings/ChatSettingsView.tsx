import '../../components/ChatSettingsContainer.css';
import type { ChatSettings } from '../../types';
import { ChatSettingsToggleButton } from '../../ui/ChatSettingsToggleButton';
import { ChatSettingsPanel } from '../../ui/ChatSettingsPanel';

interface ChatSettingsViewProps {
  settings: ChatSettings;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onTemperatureChange: (value: number) => void;
  onMaxTokensChange: (value: number) => void;
  onPresencePenaltyChange: (value: number) => void;
  onModeChange: (mode: 'fast' | 'expert') => void;
}

export function ChatSettingsView({
  settings,
  isExpanded,
  onToggleExpand,
  onTemperatureChange,
  onMaxTokensChange,
  onPresencePenaltyChange,
  onModeChange,
}: ChatSettingsViewProps) {
  return (
    <div className="chat-settings-panel">
      <ChatSettingsToggleButton 
        isExpanded={isExpanded} 
        onClick={onToggleExpand}
      />
      <ChatSettingsPanel
        settings={settings}
        isExpanded={isExpanded}
        onTemperatureChange={onTemperatureChange}
        onMaxTokensChange={onMaxTokensChange}
        onPresencePenaltyChange={onPresencePenaltyChange}
        onModeChange={onModeChange}
      />
    </div>
  );
}
