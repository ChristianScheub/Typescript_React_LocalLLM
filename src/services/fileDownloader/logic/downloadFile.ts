import Logger from '@services/logger';

const downloadFile = (base64Data: string, fileName: string) => {
  Logger.infoService(`[fileDownloader] Starting file download: ${fileName}`);
  Logger.cache(`[fileDownloader] File size: ${(base64Data.length / 1024).toFixed(2)} KB`);
  
  try {
    const blob = new Blob([base64Data], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    Logger.infoService(`[fileDownloader] ✅ File downloaded successfully: ${fileName}`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    Logger.errorService(`[fileDownloader] ❌ Error downloading file: ${errorMsg}`);
    Logger.errorStack('[fileDownloader] Stack trace:', 
      error instanceof Error ? error : new Error(errorMsg));
    throw error;
  }
};

export { downloadFile };
