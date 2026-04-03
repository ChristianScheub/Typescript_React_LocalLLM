import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deletionService } from '@services/deletion';
import { AppSettingsView } from '@views/AppSettings/AppSettingsView';

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
    <AppSettingsView
      expandedOptions={expandedOptions}
      showConfirmDelete={showConfirmDelete}
      successMessage={successMessage}
      isDeleting={isDeleting}
      onToggleExpand={toggleExpanded}
      onToggleConfirm={setShowConfirmDelete}
      onDeleteAllData={handleDeleteAllData}
      onDeleteModels={handleDeleteModels}
      onCloseSuccess={() => setSuccessMessage(null)}
    />
  );
}
