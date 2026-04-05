import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deletionService } from '@services/deletion';
import Logger from '@services/logger';
import { AppSettingsView } from '@views/AppSettings/AppSettingsView';

export function SettingsContainer() {
  const { t } = useTranslation();
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);

  const handleDeleteAllData = async () => {
    setIsDeleting(true);
    try {
      await deletionService.deleteAllData();
      setSuccessMessage(t('settings.deleteAllDataSuccess'));
      
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      Logger.errorStack('[SettingsContainer] Delete all data failed', error instanceof Error ? error : new Error(errorMsg));
      alert('Error: ' + errorMsg);
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
      
      setTimeout(() => {
        setSuccessMessage(null);
        setIsDeleting(false);
      }, 2000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      Logger.errorStack('[SettingsContainer] Delete models failed', error instanceof Error ? error : new Error(errorMsg));
      alert('Error: ' + errorMsg);
      setIsDeleting(false);
    } finally {
      setShowConfirmDelete(null);
    }
  };

  return (
    <AppSettingsView
      showConfirmDelete={showConfirmDelete}
      successMessage={successMessage}
      isDeleting={isDeleting}
      onDeleteAllData={handleDeleteAllData}
      onDeleteModels={handleDeleteModels}
      expandedInfo={expandedInfo}
      onInfoOpen={setExpandedInfo}
      onInfoClose={() => setExpandedInfo(null)}
      onConfirmClose={() => setShowConfirmDelete(null)}
      onShowConfirmDelete={setShowConfirmDelete}
    />
  );
}
