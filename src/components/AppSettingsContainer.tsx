import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiTrash2, FiBook, FiGithub, FiCheckCircle } from 'react-icons/fi';
import { deletionService } from '@services/deletion';
import { Modal } from '@ui/Modal';
import { SettingsOptionItem } from '@ui/SettingsOptionItem';
import { PrivacyContent } from '@ui/PrivacyContent';
import { ImpressumContent } from '@ui/ImpressumContent';
import { LibrariesContent } from '@ui/LibrariesContent';

export function AppSettingsContainer() {
  const { t } = useTranslation();
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [expandedOptions, setExpandedOptions] = useState<Set<string>>(new Set());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedOptions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedOptions(newExpanded);
  };

  const handleDeleteAllData = async () => {
    setIsDeleting(true);
    try {
      await deletionService.deleteAllData();
      setSuccessMessage(t('settings.deleteAllDataSuccess'));
      
      // Reload after 2.5 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setIsDeleting(false);
    } finally {
      setShowConfirmDelete(null);
    }
  };

  const handleDeleteModels = async () => {
    setIsDeleting(true);
    try {
      await deletionService.deleteAllModels();
      setSuccessMessage(t('settings.deleteModelsSuccess'));
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setSuccessMessage(null);
        setIsDeleting(false);
      }, 2000);
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setIsDeleting(false);
    } finally {
      setShowConfirmDelete(null);
    }
  };

  return (
    <div className="app-settings-view">
      <div className="settings-header">
        <h2>{t('settings.appSettings')}</h2>
        <p className="settings-description">{t('settings.appSettingsDescription')}</p>
      </div>

      <div className="settings-options">
        <SettingsOptionItem
          id="delete-all-data"
          icon={<FiTrash2 size={24} />}
          titleKey="settings.deleteAllData"
          descriptionKey="settings.deleteAllDataDescription"
          isDangerous={true}
          showConfirm={showConfirmDelete === 'delete-all-data'}
          onToggleConfirm={setShowConfirmDelete}
          onAction={handleDeleteAllData}
        />

        <SettingsOptionItem
          id="delete-models"
          icon={<FiTrash2 size={24} />}
          titleKey="settings.deleteModels"
          descriptionKey="settings.deleteModelsDescription"
          isDangerous={true}
          showConfirm={showConfirmDelete === 'delete-models'}
          onToggleConfirm={setShowConfirmDelete}
          onAction={handleDeleteModels}
        />

        <SettingsOptionItem
          id="privacy"
          icon={<FiBook size={24} />}
          titleKey="settings.privacy"
          descriptionKey="settings.privacyDescription"
          isExpanded={expandedOptions.has('privacy')}
          onToggleExpand={toggleExpanded}
        >
          <PrivacyContent />
        </SettingsOptionItem>

        <SettingsOptionItem
          id="impressum"
          icon={<FiBook size={24} />}
          titleKey="settings.impressum"
          descriptionKey="settings.impressumDescription"
          isExpanded={expandedOptions.has('impressum')}
          onToggleExpand={toggleExpanded}
        >
          <ImpressumContent />
        </SettingsOptionItem>

        <SettingsOptionItem
          id="libraries"
          icon={<FiBook size={24} />}
          titleKey="settings.libraries"
          descriptionKey="settings.librariesDescription"
          isExpanded={expandedOptions.has('libraries')}
          onToggleExpand={toggleExpanded}
        >
          <LibrariesContent />
        </SettingsOptionItem>

        <SettingsOptionItem
          id="github"
          icon={<FiGithub size={24} />}
          titleKey="settings.github"
          descriptionKey="settings.githubDescription"
          hasLink={true}
          link={t('settings.githubLink')}
        />
      </div>

      {successMessage && (
        <Modal isOpen={true} title="✅ Success" onClose={() => setSuccessMessage(null)}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <FiCheckCircle size={48} style={{ color: '#10b981', marginBottom: '16px' }} />
            <h3>{successMessage}</h3>
            {isDeleting && <p style={{ marginTop: '16px', color: '#6b7280' }}>{t('settings.reloadingPage')}</p>}
          </div>
        </Modal>
      )}
    </div>
  );
}
