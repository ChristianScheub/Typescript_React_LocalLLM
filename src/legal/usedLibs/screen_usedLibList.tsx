import React from "react";
import { useTranslation } from "react-i18next";

interface NpmModule {
  name: string;
  version: string;
  licenses: string;
  repository: string;
}

interface UsedLibListScreenProps {
  open: boolean;
  handleClose: () => void;
  npmModules: NpmModule[];
}

const UsedLibListScreen: React.FC<UsedLibListScreenProps> = ({
  handleClose,
  npmModules,
}) => {
  const { t } = useTranslation();
  const handleModuleClick = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div>
      <div data-testid="used-lib-list-modal">
        {npmModules.map((module, index) => (
          <div
            key={module.name+module.version+index}
            onClick={() => handleModuleClick(module.repository)}
            style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #ddd' }}
          >
            <div><strong>{module.name}@{module.version}</strong></div>
            <div>License: {module.licenses}</div>
          </div>
        ))}
      </div>
      <button onClick={handleClose} data-testid="close-btn-lib-list-modal">
        {t("setting_OpenSourceModulListClose")}
      </button>
    </div>
  );
};

export default UsedLibListScreen;