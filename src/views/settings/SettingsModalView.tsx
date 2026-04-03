import { Modal } from '../../ui/Modal';
import { SettingsView } from './SettingsView';

interface Model {
  id: string;
  name: string;
  description: string;
  size: string;
  downloaded: boolean;
}

interface SettingsModalViewProps {
  isOpen: boolean;
  onClose: () => void;
  currentProvider: 'transformers' | 'webllm';
  onProviderChange: (provider: 'transformers' | 'webllm') => void;
  models: Model[];
  downloadingModel: string | null;
  downloadProgress: number;
  onDownload: (modelId: string) => void;
  error: string | null;
  statusMessage?: string | null;
}

export function SettingsModalView({
  isOpen,
  onClose,
  currentProvider,
  onProviderChange,
  models,
  downloadingModel,
  downloadProgress,
  onDownload,
  error,
  statusMessage,
}: SettingsModalViewProps) {
  return (
    <Modal isOpen={isOpen} title="" onClose={onClose}>
      <SettingsView
        currentProvider={currentProvider}
        onProviderChange={onProviderChange}
        models={models}
        downloadingModel={downloadingModel}
        downloadProgress={downloadProgress}
        onDownload={onDownload}
        error={error}
        statusMessage={statusMessage}
      />
    </Modal>
  );
}
