import CodeToTextParser from "./codeToTextParser";
import React from "react";
import { useTranslation } from "react-i18next";

const Datenschutz: React.FC = () => {
  const { t } = useTranslation();
  const lines = Array.from({ length: 34 }, (_, i) =>
    t(`privacy.line_${i + 1}`)
  );

  return (
    <div>
      <div
        style={{
          marginTop: "env(safe-area-inset-top)",
        }}
      >
        <div className="after-login-container">
            <h2>Infos:</h2>
              {lines.map((line, index) => (
                <CodeToTextParser key={index} code={line} />
              ))}
              <a href="https://policies.google.com/privacy">
                Google: https://policies.google.com/privacy
              </a>
              <br />
              <br />
              <br />
              <br />
        </div>
      </div>
    </div>
  );
};

export default Datenschutz;
