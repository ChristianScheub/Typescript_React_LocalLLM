import React from "react";
import { useTranslation } from "react-i18next";
import { impressum_text } from "./app_texts";
import CodeToTextParser from "./codeToTextParser";

const Impressum: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <div>
        <h2>{t("settings_Impressum")}</h2>
        <div>
          <div>
            <h3>Impressum / Legal Notice</h3>
            <div>
              <CodeToTextParser code={impressum_text} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Impressum;
