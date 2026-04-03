import { useTranslation } from 'react-i18next';
import { Modal } from '@ui/Modal';
import { AppSettingsView } from '@views/settings/AppSettingsView';

interface SettingsModalViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModalView({
  isOpen,
  onClose,
}: SettingsModalViewProps) {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} title={t('settings.title')} onClose={onClose}>
      <AppSettingsView />
    </Modal>
  );
}
