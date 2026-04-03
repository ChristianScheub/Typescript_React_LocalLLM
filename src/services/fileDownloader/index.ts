import { downloadFile } from '@services/fileDownloader/logic/downloadFile';
import { generateFileName } from '@services/fileDownloader/logic/generateFileName';
import type { IFileDownloaderService } from '@services/fileDownloader/IFileDownloaderService';

const handleFileDownload = async (logs: string): Promise<void> => {
  if (logs) {
    downloadFile(logs, generateFileName());
  }
};

const fileDownloaderService: IFileDownloaderService = {
  handleFileDownload,
};

export { fileDownloaderService };
export type { IFileDownloaderService } from '@services/fileDownloader/IFileDownloaderService';
