import type { ChatSettings } from '@types';
import { ModeSelector } from '@ui/ModeSelector';
import { TemperatureSlider } from '@ui/TemperatureSlider';
import { MaxTokensInput } from '@ui/MaxTokensInput';
import { PresencePenaltySlider } from '@ui/PresencePenaltySlider';

interface ChatSettingsPanelProps {
  settings: ChatSettings;
  isExpanded: boolean;
  onTemperatureChange: (value: number) => void;
  onMaxTokensChange: (value: number) => void;
  onPresencePenaltyChange: (value: number) => void;
  onModeChange: (mode: 'fast' | 'expert') => void;
}

export function ChatSettingsPanel({
  settings,
  isExpanded,
  onTemperatureChange,
  onMaxTokensChange,
  onPresencePenaltyChange,
  onModeChange,
}: ChatSettingsPanelProps) {
  return (
    <>
      {isExpanded && (
        <div className="settings-content">
          <ModeSelector mode={settings.mode} onChange={onModeChange} />
          <TemperatureSlider temperature={settings.temperature} onChange={onTemperatureChange} />
          <MaxTokensInput maxTokens={settings.maxTokens} onChange={onMaxTokensChange} />
          <PresencePenaltySlider presencePenalty={settings.presencePenalty} onChange={onPresencePenaltyChange} />
        </div>
      )}
    </>
  );
}
