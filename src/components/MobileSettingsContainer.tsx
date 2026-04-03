import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deletionService } from '@services/deletion';
import Logger from '@services/logger';
import { MobileSettingsView } from '@views/MobileSettings/MobileSettingsView';

export function MobileSettingsContainer() {
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
      Logger.errorStack('[MobileSettingsContainer] Delete all data failed', error instanceof Error ? error : new Error(errorMsg));
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
        window.location.reload();
      }, 2500);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      Logger.errorStack('[MobileSettingsContainer] Delete models failed', error instanceof Error ? error : new Error(errorMsg));
      alert('Error: ' + errorMsg);
      setIsDeleting(false);
    } finally {
      setShowConfirmDelete(null);
    }
  };

  return (
    <MobileSettingsView
      showConfirmDelete={showConfirmDelete}
      successMessage={successMessage}
      isDeleting={isDeleting}
      expandedInfo={expandedInfo}
      onDeleteAllData={handleDeleteAllData}
      onDeleteModels={handleDeleteModels}
      onConfirmClose={() => setShowConfirmDelete(null)}
      onInfoOpen={setExpandedInfo}
      onInfoClose={() => setExpandedInfo(null)}
    />
  );
}
