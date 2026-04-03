import { useTranslation } from 'react-i18next';

export function PrivacyContent() {
  const { t } = useTranslation();
  return <p>{t('settings.privacyContent')}</p>;
}
