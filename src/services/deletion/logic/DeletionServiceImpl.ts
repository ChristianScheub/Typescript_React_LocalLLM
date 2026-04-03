import type { IDeletionService } from '../IDeletionService';
import Logger from '@services/logger';

export class DeletionServiceImpl implements IDeletionService {
  async deleteAllData(): Promise<void> {
    Logger.infoService('[deletionService.deleteAllData] Starting full data deletion (including models)...');
    try {
      // First delete all AI models
      Logger.infoService('[deletionService.deleteAllData] Deleting all AI models...');
      await this.deleteAllModels();
      Logger.cache('[deletionService.deleteAllData] ✅ All models deleted');

      Logger.infoService('[deletionService.deleteAllData] Clearing localStorage...');
      localStorage.clear();
      Logger.cache('[deletionService.deleteAllData] ✅ localStorage cleared');

      Logger.infoService('[deletionService.deleteAllData] Clearing sessionStorage...');
      sessionStorage.clear();
      Logger.cache('[deletionService.deleteAllData] ✅ sessionStorage cleared');

      if (window.indexedDB) {
        Logger.infoService('[deletionService.deleteAllData] Clearing IndexedDB databases...');
        const databases = await indexedDB.databases();
        Logger.cache(`[deletionService.deleteAllData] Found ${databases.length} IndexedDB databases`);
        
        databases.forEach((db) => {
          if (db.name) {
            Logger.cache(`[deletionService.deleteAllData] Deleting IndexedDB: ${db.name}`);
            indexedDB.deleteDatabase(db.name);
          }
        });
        Logger.cache('[deletionService.deleteAllData] ✅ All IndexedDB databases cleared');
      }

      Logger.infoService('[deletionService.deleteAllData] ✅ All data and models deleted successfully');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      Logger.errorService(`[deletionService.deleteAllData] ❌ Error during deletion: ${errorMsg}`);
      Logger.errorStack('[deletionService.deleteAllData] Stack trace:', 
        error instanceof Error ? error : new Error(errorMsg));
      throw new Error(errorMsg);
    }
  }

  async deleteAllModels(): Promise<void> {
    Logger.infoService('[deletionService.deleteAllModels] Starting model cache deletion...');
    try {
      // Clear Browser Cache API - where Web-LLM stores models
      if ('caches' in window) {
        Logger.infoService('[deletionService.deleteAllModels] Clearing browser Cache API...');
        const cacheNames = await caches.keys();
        Logger.cache(`[deletionService.deleteAllModels] Found ${cacheNames.length} caches`);
        
        await Promise.all(
          cacheNames.map((cacheName) => {
            Logger.cache(`[deletionService.deleteAllModels] Deleting cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
        );
        Logger.cache('[deletionService.deleteAllModels] ✅ All caches cleared');
      }

      // Also clear any WebLLM-related localStorage/sessionStorage
      Logger.infoService('[deletionService.deleteAllModels] Clearing WebLLM-related localStorage keys...');
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('mlc') || 
          key.includes('webllm') || 
          key.includes('model') ||
          key.includes('cache')
        )) {
          keysToRemove.push(key);
          Logger.cache(`[deletionService.deleteAllModels] Found key to remove: ${key}`);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      Logger.cache(`[deletionService.deleteAllModels] ✅ Removed ${keysToRemove.length} localStorage keys`);

      Logger.infoService('[deletionService.deleteAllModels] ✅ Model deletion completed successfully');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      Logger.errorService(`[deletionService.deleteAllModels] ❌ Error during model deletion: ${errorMsg}`);
      Logger.errorStack('[deletionService.deleteAllModels] Stack trace:', 
        error instanceof Error ? error : new Error(errorMsg));
      throw new Error(errorMsg);
    }
  }
}
