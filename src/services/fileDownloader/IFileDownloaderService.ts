export interface IFileDownloaderService {
  handleFileDownload(logs: string): Promise<void>;
}
