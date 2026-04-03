import { useTranslation } from 'react-i18next';

export function ImpressumContent() {
  const { t } = useTranslation();
  return <p>{t('settings.impressumContent')}</p>;
}
