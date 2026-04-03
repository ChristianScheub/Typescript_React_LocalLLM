import { FiExternalLink, FiTrash2, FiChevronDown } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from './ConfirmationDialog';

interface SettingsOptionItemProps {
  id: string;
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
  isDangerous?: boolean;
  hasLink?: boolean;
  link?: string;
  isExpanded?: boolean;
  showConfirm?: boolean;
  onToggleConfirm?: (id: string | null) => void;
  onToggleExpand?: (id: string) => void;
  onAction?: () => void;
  children?: React.ReactNode;
}

export function SettingsOptionItem({
  id,
  icon,
  titleKey,
  descriptionKey,
  isDangerous,
  hasLink,
  link,
  isExpanded,
  showConfirm,
  onToggleConfirm,
  onToggleExpand,
  onAction,
  children,
}: SettingsOptionItemProps) {
  const { t } = useTranslation();

  return (
    <div className={`settings-option ${isDangerous ? 'dangerous' : ''} ${isExpanded ? 'expanded' : ''}`}>
      <div className="option-header">
        <div className="option-icon">{icon}</div>
        <div className="option-content">
          <h3>{t(titleKey)}</h3>
          <p>{t(descriptionKey)}</p>
        </div>
        <div className="option-action">
          {hasLink && link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="action-link"
            >
              <FiExternalLink size={20} />
            </a>
          ) : isDangerous ? (
            <button
              className="action-button danger"
              onClick={() => onToggleConfirm?.(id)}
              title={t('settings.deleteModels')}
            >
              <FiTrash2 size={20} />
            </button>
          ) : (
            <button
              className={`action-button expand ${isExpanded ? 'active' : ''}`}
              onClick={() => onToggleExpand?.(id)}
              title={isExpanded ? t('settings.collapseLabel') : t('settings.expandLabel')}
            >
              <FiChevronDown size={20} className={`chevron ${isExpanded ? 'rotated' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {showConfirm && isDangerous && onAction && (
        <ConfirmationDialog onCancel={() => onToggleConfirm?.(null)} onConfirm={onAction} />
      )}

      {!isDangerous && !hasLink && isExpanded && <div className="option-content-expanded">{children}</div>}
    </div>
  );
}
