import { useTranslation } from 'react-i18next';
import { HuggingFaceAuthInput } from '@ui/HuggingFaceAuthInput';
import { useHuggingFaceTokenAuth } from '@hooks/useHuggingFaceTokenAuth';

interface HuggingFaceAuthContainerProps {
  onTokenChange?: (hasToken: boolean) => void;
}

export function HuggingFaceAuthContainer({ onTokenChange }: HuggingFaceAuthContainerProps) {
  const { t } = useTranslation();
  const {
    token,
    displayToken,
    showToken,
    hasToken,
    isSaving,
    saveMessage,
    isEditing,
    isExpanded,
    onTokenChange: handleTokenChange,
    onToggleShowToken,
    onSaveToken,
    onClearToken,
    onEdit,
    onCancel,
    onToggleExpanded,
  } = useHuggingFaceTokenAuth(onTokenChange);

  return (
    <HuggingFaceAuthInput
      token={token}
      displayToken={displayToken}
      showToken={showToken}
      onTokenChange={handleTokenChange}
      onToggleShowToken={onToggleShowToken}
      onSaveToken={onSaveToken}
      onClearToken={onClearToken}
      onEdit={onEdit}
      onCancel={onCancel}
      hasToken={hasToken}
      isEditing={isEditing}
      isSaving={isSaving}
      saveMessage={saveMessage}
      isExpanded={isExpanded}
      onToggleExpanded={onToggleExpanded}
      description={t('huggingfaceAuth.huggingfaceDescription')}
      authConfiguredLabel={t('huggingfaceAuth.authenticationConfigured')}
      editLabel={t('common.edit')}
      removeLabel={t('common.remove')}
      saveLabel={t('common.save')}
      savingLabel={t('common.saving')}
      cancelLabel={t('common.cancel')}
      tokenSavedMsg={t('huggingfaceAuth.tokenSaved')}
      tokenInvalidMsg={t('huggingfaceAuth.tokenInvalid')}
      hintText={t('huggingfaceAuth.huggingfaceHint')}
    />
  );
}
