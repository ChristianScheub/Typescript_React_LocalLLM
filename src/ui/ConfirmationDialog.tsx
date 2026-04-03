import { useTranslation } from 'react-i18next';

interface ConfirmationDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmationDialog({ onCancel, onConfirm }: ConfirmationDialogProps) {
  const { t } = useTranslation();

  return (
    <div className="confirmation-dialog">
      <div className="dialog-content">
        <p className="dialog-title">{t('settings.confirmDelete')}</p>
        <p className="dialog-message">{t('settings.confirmDeleteMessage')}</p>
        <div className="dialog-actions">
          <button className="btn-cancel" onClick={onCancel}>
            {t('settings.cancel')}
          </button>
          <button className="btn-confirm" onClick={onConfirm}>
            {t('settings.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
