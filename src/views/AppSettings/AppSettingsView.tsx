import { FiTrash2, FiBook, FiGithub, FiCheckCircle } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { Modal } from '@ui/Modal';
import { SettingsOptionItem } from '@ui/SettingsOptionItem';
import Datenschutz from '../../legal/datenschutz';
import Impressum from '../../legal/impressum';
import UsedLibsListContainer from '../../legal/usedLibs/container_usedLibList';
import './AppSettingsView.css';

interface AppSettingsViewProps {
  expandedOptions: Set<string>;
  showConfirmDelete: string | null;
  successMessage: string | null;
  isDeleting: boolean;
  onToggleExpand: (id: string) => void;
  onToggleConfirm: (id: string | null) => void;
  onDeleteAllData: () => void;
  onDeleteModels: () => void;
  onCloseSuccess: () => void;
}

export function AppSettingsView({
  expandedOptions,
  showConfirmDelete,
  successMessage,
  isDeleting,
  onToggleExpand,
  onToggleConfirm,
  onDeleteAllData,
  onDeleteModels,
  onCloseSuccess,
}: AppSettingsViewProps) {
  const { t } = useTranslation();

  return (
    <>
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
            onToggleConfirm={onToggleConfirm}
            onAction={onDeleteAllData}
          />

          <SettingsOptionItem
            id="delete-models"
            icon={<FiTrash2 size={24} />}
            titleKey="settings.deleteModels"
            descriptionKey="settings.deleteModelsDescription"
            isDangerous={true}
            showConfirm={showConfirmDelete === 'delete-models'}
            onToggleConfirm={onToggleConfirm}
            onAction={onDeleteModels}
          />

          <SettingsOptionItem
            id="privacy"
            icon={<FiBook size={24} />}
            titleKey="settings.privacy"
            descriptionKey="settings.privacyDescription"
            isExpanded={expandedOptions.has('privacy')}
            onToggleExpand={onToggleExpand}
          >
            <Datenschutz />
          </SettingsOptionItem>

          <SettingsOptionItem
            id="impressum"
            icon={<FiBook size={24} />}
            titleKey="settings.impressum"
            descriptionKey="settings.impressumDescription"
            isExpanded={expandedOptions.has('impressum')}
            onToggleExpand={onToggleExpand}
          >
            <Impressum />
          </SettingsOptionItem>

          <SettingsOptionItem
            id="libraries"
            icon={<FiBook size={24} />}
            titleKey="settings.libraries"
            descriptionKey="settings.librariesDescription"
            isExpanded={expandedOptions.has('libraries')}
            onToggleExpand={onToggleExpand}
          >
            <UsedLibsListContainer />
          </SettingsOptionItem>

          <SettingsOptionItem
            id="github"
            icon={<FiGithub size={24} />}
            titleKey="settings.github"
            descriptionKey="settings.githubDescription"
            hasLink={true}
            link={"https://github.com/ChristianScheub/Typescript_React_LocalLLM"}
          />
        </div>
      </div>

      {successMessage && (
        <Modal isOpen={true} title="✅ Success" onClose={onCloseSuccess}>
          <div className="settings-success-content">
            <FiCheckCircle size={48} className="settings-success-icon" />
            <h3>{successMessage}</h3>
            {isDeleting && <p className="settings-reloading">{t('settings.reloadingPage')}</p>}
          </div>
        </Modal>
      )}
    </>
  );
}
