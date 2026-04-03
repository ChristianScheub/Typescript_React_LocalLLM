import { FiTrash2, FiBook, FiGithub, FiCheckCircle } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { Modal } from '@ui/Modal';
import { PrivacyContent } from '@ui/PrivacyContent';
import { ImpressumContent } from '@ui/ImpressumContent';
import { LibrariesContent } from '@ui/LibrariesContent';
import { MobileSettingItem } from '@ui/MobileSettingItem';
import './MobileSettingsView.css';

interface MobileSettingsViewProps {
  showConfirmDelete: string | null;
  successMessage: string | null;
  isDeleting: boolean;
  expandedInfo: string | null;
  onDeleteAllData: () => void;
  onDeleteModels: () => void;
  onConfirmClose: () => void;
  onInfoOpen: (info: string) => void;
  onInfoClose: () => void;
}

export function MobileSettingsView({
  showConfirmDelete,
  successMessage,
  isDeleting,
  expandedInfo,
  onDeleteAllData,
  onDeleteModels,
  onConfirmClose,
  onInfoOpen,
  onInfoClose,
}: MobileSettingsViewProps) {
  const { t } = useTranslation();

  const dangerSections = [
    {
      id: 'delete-all',
      title: t('settings.deleteAllData'),
      icon: <FiTrash2 size={20} />,
      description: t('settings.deleteAllDataDescription'),
      action: () => showConfirmDelete !== 'delete-all' && onInfoOpen('delete-all'),
      isDanger: true
    },
    {
      id: 'delete-models',
      title: t('settings.deleteModels'),
      icon: <FiTrash2 size={20} />,
      description: t('settings.deleteModelsDescription'),
      action: () => showConfirmDelete !== 'delete-models' && onInfoOpen('delete-models'),
      isDanger: true
    },
  ];

  const infoSections = [
    {
      id: 'privacy',
      title: t('settings.privacy'),
      icon: <FiBook size={20} />,
      description: t('settings.privacyDescription'),
      action: () => onInfoOpen('privacy'),
      isDanger: false
    },
    {
      id: 'impressum',
      title: t('settings.impressum'),
      icon: <FiBook size={20} />,
      description: t('settings.impressumDescription'),
      action: () => onInfoOpen('impressum'),
      isDanger: false
    },
    {
      id: 'libraries',
      title: t('settings.libraries'),
      icon: <FiBook size={20} />,
      description: t('settings.librariesDescription'),
      action: () => onInfoOpen('libraries'),
      isDanger: false
    },
    {
      id: 'github',
      title: t('settings.github'),
      icon: <FiGithub size={20} />,
      description: t('settings.githubDescription'),
      action: () => window.open(t('settings.githubLink'), '_blank'),
      isDanger: false
    }
  ];

  return (
    <div className="mobile-settings-view">
      <div className="settings-header">
        <h2>{t('settings.appSettings')}</h2>
      </div>

      <div className="settings-content">
        <div className="danger-section">
          {dangerSections.map((section) => (
            <MobileSettingItem
              key={section.id}
              icon={section.icon}
              title={section.title}
              description={section.description}
              isDanger={section.isDanger}
              onClick={section.action}
            />
          ))}
        </div>

        <div className="info-section">
          {infoSections.map((section) => (
            <MobileSettingItem
              key={section.id}
              icon={section.icon}
              title={section.title}
              description={section.description}
              isDanger={section.isDanger}
              onClick={section.action}
            />
          ))}
        </div>
      </div>

      {successMessage && (
        <Modal isOpen={true} title="✅ Success" onClose={onConfirmClose}>
          <div className="confirm-dialog">
            <FiCheckCircle size={48} style={{ color: '#10b981', marginBottom: '16px' }} />
            <h3>{successMessage}</h3>
            {isDeleting && <p style={{ marginTop: '16px', color: '#6b7280' }}>{t('settings.reloadingPage')}</p>}
          </div>
        </Modal>
      )}

      {showConfirmDelete && (
        <Modal isOpen={true} title={t('settings.confirm')} onClose={onConfirmClose}>
          <div className="confirm-dialog">
            <h3>
              {showConfirmDelete === 'delete-all' 
                ? t('settings.confirmDeleteAllData')
                : t('settings.confirmDeleteModels')}
            </h3>
            <p>
              {showConfirmDelete === 'delete-all'
                ? t('settings.confirmDeleteAllDataDesc')
                : t('settings.confirmDeleteModelsDesc')}
            </p>
            <div className="dialog-actions">
              <button 
                className="btn-cancel"
                onClick={onConfirmClose}
              >
                {t('common.cancel')}
              </button>
              <button 
                className="btn-confirm"
                onClick={showConfirmDelete === 'delete-all' ? onDeleteAllData : onDeleteModels}
                disabled={isDeleting}
              >
                {isDeleting ? t('common.deleting') : t('common.delete')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {expandedInfo && expandedInfo !== 'delete-all' && expandedInfo !== 'delete-models' && (
        <Modal isOpen={true} title={expandedInfo === 'privacy' ? t('settings.privacy') : expandedInfo === 'impressum' ? t('settings.impressum') : t('settings.libraries')} onClose={onInfoClose}>
          <div className="info-modal">
            {expandedInfo === 'privacy' && <PrivacyContent />}
            {expandedInfo === 'impressum' && <ImpressumContent />}
            {expandedInfo === 'libraries' && <LibrariesContent />}
          </div>
        </Modal>
      )}
    </div>
  );
}
