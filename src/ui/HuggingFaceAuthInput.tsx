import { FiEye, FiEyeOff, FiTrash2, FiCheck, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './HuggingFaceAuthInput.css';

interface HuggingFaceAuthInputProps {
  token: string;
  displayToken: string;
  showToken: boolean;
  onTokenChange: (value: string) => void;
  onToggleShowToken: () => void;
  onSaveToken: () => void;
  onClearToken: () => void;
  onEdit: () => void;
  onCancel: () => void;
  hasToken: boolean;
  isEditing: boolean;
  isSaving: boolean;
  saveMessage: 'success' | 'error' | null;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  description: string;
  authConfiguredLabel: string;
  editLabel: string;
  removeLabel: string;
  saveLabel: string;
  savingLabel: string;
  cancelLabel: string;
  tokenSavedMsg: string;
  tokenInvalidMsg: string;
  hintText: string;
}

export function HuggingFaceAuthInput({
  token,
  displayToken,
  showToken,
  onTokenChange,
  onToggleShowToken,
  onSaveToken,
  onClearToken,
  onEdit,
  onCancel,
  hasToken,
  isEditing,
  isSaving,
  saveMessage,
  isExpanded,
  onToggleExpanded,
  description,
  authConfiguredLabel,
  editLabel,
  removeLabel,
  saveLabel,
  savingLabel,
  cancelLabel,
  tokenSavedMsg,
  tokenInvalidMsg,
  hintText,
}: HuggingFaceAuthInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSaveToken();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="hf-auth-input">
      <div className="hf-auth-header">
        <button
          className="hf-auth-toggle"
          onClick={onToggleExpanded}
          type="button"
        >
          <div className="toggle-content">
            <span className="toggle-icon">
              {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </span>
            <div className="toggle-text">
              <h3 className="hf-auth-title">
                🤗 Hugging Face Authentication
              </h3>
              {hasToken && !isEditing && (
                <span className="token-status-badge">
                  <FiCheck size={14} /> {authConfiguredLabel}
                </span>
              )}
            </div>
          </div>
        </button>
      </div>

      {isExpanded && (
        <div className="hf-auth-content">
          <p className="hf-auth-description">{description}</p>

          {!isEditing && hasToken && (
            <div className="hf-auth-status success">
              <div className="status-indicator">
                <FiCheck size={20} />
                <span>{authConfiguredLabel}</span>
              </div>
              <div className="token-display">
                <code>{displayToken}</code>
              </div>
              <button
                className="hf-auth-button secondary"
                onClick={onEdit}
              >
                {editLabel}
              </button>
              <button
                className="hf-auth-button danger"
                onClick={onClearToken}
                title={removeLabel}
              >
                <FiTrash2 size={16} />
                {removeLabel}
              </button>
            </div>
          )}

          {(isEditing || !hasToken) && (
            <div className="hf-auth-input-group">
              <div className="input-wrapper">
                <input
                  type={showToken ? 'text' : 'password'}
                  placeholder="hf_xxxxxxxxxxxxxxxxxxxxx"
                  value={token}
                  onChange={(e) => onTokenChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSaving}
                  className={`hf-auth-field ${saveMessage ? saveMessage : ''}`}
                  autoComplete="off"
                />
                <button
                  className="toggle-visibility"
                  onClick={onToggleShowToken}
                  type="button"
                  disabled={!token}
                >
                  {showToken ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>

              {saveMessage && (
                <div className={`save-message ${saveMessage}`}>
                  {saveMessage === 'success' ? tokenSavedMsg : tokenInvalidMsg}
                </div>
              )}

              <div className="button-group">
                <button
                  className="hf-auth-button primary"
                  onClick={onSaveToken}
                  disabled={!token.trim() || isSaving}
                >
                  {isSaving ? savingLabel : saveLabel}
                </button>
                {isEditing && (
                  <button
                    className="hf-auth-button secondary"
                    onClick={onCancel}
                    disabled={isSaving}
                  >
                    {cancelLabel}
                  </button>
                )}
              </div>

              <p className="hf-auth-hint">
                {hintText}
                <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer">
                  huggingface.co/settings/tokens
                </a>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
