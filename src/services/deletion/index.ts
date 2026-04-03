import { DeletionServiceImpl } from './logic/DeletionServiceImpl';
import type { IDeletionService } from './IDeletionService';

export type { IDeletionService } from './IDeletionService';
export const deletionService: IDeletionService = new DeletionServiceImpl();
