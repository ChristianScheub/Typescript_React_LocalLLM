import "./SettingsView.css";
import "../mobileOnly/MobileModels/MobileModelsView.css";
import { FiSearch } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { MobileModelCard } from "@ui/mobileOnly/MobileModelCard";
import { MobileEngineSelector } from "@ui/mobileOnly/MobileEngineSelector";
import { HuggingFaceAuthContainer } from "@components/HuggingFaceAuthContainer";
import type { ModelFamily } from "@services/webllm/IWebllmService";

interface Model {
  id: string;
  name: string;
  description: string;
  size: string;
  downloaded: boolean;
  isCached?: boolean;
  family: ModelFamily;
}

interface SettingsViewProps {
  currentProvider: "transformers" | "webllm";
  onProviderChange: (provider: "transformers" | "webllm") => void;
  models: Model[];
  downloadingModel: string | null;
  downloadProgress: number;
  onDownload: (modelId: string) => void;
  error: string | null;
  statusMessage?: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFamily: ModelFamily | "All";
  onFamilyChange: (family: ModelFamily | "All") => void;
  availableFamilies: ModelFamily[];
  maxVram: number;
  onMaxVramChange: (value: number) => void;
}

export function SettingsView({
  currentProvider,
  onProviderChange,
  models,
  downloadingModel,
  downloadProgress,
  onDownload,
  error,
  statusMessage,
  searchQuery,
  onSearchChange,
  activeFamily,
  onFamilyChange,
  availableFamilies,
  maxVram,
  onMaxVramChange,
}: SettingsViewProps) {
  const { t } = useTranslation();

  const handleToggleProvider = () => {
    if (currentProvider === "webllm") {
      onProviderChange("transformers");
    } else if (currentProvider === "transformers") {
      onProviderChange("webllm");
    }
  };

  return (
    <div className="mobile-models-view">
      <div className="models-header">
        <h2>{t("models.engineArchitecture")}</h2>
        <p>{t("models.selectRuntime")}</p>
      </div>

      {currentProvider === "transformers" && <HuggingFaceAuthContainer />}

      <div className="models-section">
        <MobileEngineSelector
          currentProvider={currentProvider}
          onToggle={handleToggleProvider}
        />
        <h3>{t("models.availableModels")}</h3>
        <p className="models-subtitle">{t("models.modelsSubtitle")}</p>

        <div className="models-search-filter">
          <div className="models-search-bar">
            <FiSearch size={16} className="search-icon" />
            <input
              type="text"
              placeholder={t("models.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="models-search-input"
            />
          </div>
          <div className="models-filter-chips">
            <button
              className={`filter-chip ${activeFamily === "All" ? "active" : ""}`}
              onClick={() => onFamilyChange("All")}
            >
              {t("models.filterAll")}
            </button>
            {availableFamilies.map((family) => (
              <button
                key={family}
                className={`filter-chip ${activeFamily === family ? "active" : ""}`}
                onClick={() => onFamilyChange(family)}
              >
                {family}
              </button>
            ))}
          </div>
        </div>

        <div className="vram-warning-banner">
          <strong>⚠️ {t("models.vramWarningTitle", "Hinweis")}</strong>
          <p className="vram-warning-text">
            {t(
              "models.vramWarningText"            )}
          </p>
        </div>

        <div className="vram-filter">
          <div className="vram-filter-header">
            <span className="vram-filter-label">{t("models.vramFilter")}</span>
            <span className="vram-filter-value">{maxVram} GB</span>
          </div>
          <input
            type="range"
            min={1}
            max={16}
            step={0.5}
            value={maxVram}
            onChange={(e) => onMaxVramChange(parseFloat(e.target.value))}
            className="vram-slider"
          />
          <div className="vram-slider-labels">
            <span>{t("models.vramMin")}</span>
            <span>{t("models.vramMax")}</span>
          </div>
        </div>

        <div className="models-list">
          {models.map((model) => (
            <MobileModelCard
              key={model.id}
              name={model.name}
              description={model.description}
              size={model.size}
              isDownloaded={model.downloaded}
              isCached={model.isCached}
              isDownloading={downloadingModel === model.id}
              downloadProgress={downloadProgress}
              statusMessage={statusMessage || undefined}
              error={error || undefined}
              onDownload={() => onDownload(model.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
