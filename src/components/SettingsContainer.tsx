import { Logger } from '@services/logger';
import { SettingsModalView } from '@views/settings/SettingsModalView';

interface SettingsContainerProps {
  isModalOpen: boolean;
  onModalClose: () => void;
}

export function SettingsContainer({ isModalOpen, onModalClose }: SettingsContainerProps) {
  const handleModalClose = () => {
    Logger.infoService(`[SettingsContainer] Closing settings modal`);
    onModalClose();
  };

  return (
    <SettingsModalView
      isOpen={isModalOpen}
      onClose={handleModalClose}
    />
  );
}
