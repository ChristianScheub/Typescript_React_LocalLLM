import './ChatSettingsContainer.css';
import { useState } from 'react';
import type { ChatSettings } from '@types';
import { ChatSettingsView } from '@views/ChatSettings/ChatSettingsView';

interface ChatSettingsContainerProps {
  settings: ChatSettings;
  onSettingsChange: (settings: ChatSettings) => void;
  isMobile?: boolean;
}

export function ChatSettingsContainer({ settings, onSettingsChange, isMobile = false }: ChatSettingsContainerProps) {
  const [isExpanded, setIsExpanded] = useState(isMobile);

  const handleTemperatureChange = (value: number) => {
    onSettingsChange({
      ...settings,
      temperature: value,
    });
  };

  const handleMaxTokensChange = (value: number) => {
    onSettingsChange({
      ...settings,
      maxTokens: value,
    });
  };

  const handlePresencePenaltyChange = (value: number) => {
    onSettingsChange({
      ...settings,
      presencePenalty: value,
    });
  };

  const handleModeChange = (mode: 'fast' | 'expert') => {
    onSettingsChange({
      ...settings,
      mode,
    });
  };

  return (
    <ChatSettingsView
      settings={settings}
      isExpanded={isExpanded}
      onToggleExpand={isMobile ? undefined : () => setIsExpanded(!isExpanded)}
      onTemperatureChange={handleTemperatureChange}
      onMaxTokensChange={handleMaxTokensChange}
      onPresencePenaltyChange={handlePresencePenaltyChange}
      onModeChange={handleModeChange}
      isMobile={isMobile}
    />
  );
}
