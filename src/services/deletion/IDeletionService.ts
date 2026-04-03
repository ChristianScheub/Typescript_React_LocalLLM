export interface IDeletionService {
  deleteAllData(): Promise<void>;
  deleteAllModels(): Promise<void>;
}
