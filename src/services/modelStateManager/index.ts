import { ModelStateManagerImpl } from '@services/modelStateManager/logic/ModelStateManagerImpl';
import type { IModelStateManagerService } from '@services/modelStateManager/IModelStateManagerService';

const modelStateManager: IModelStateManagerService = new ModelStateManagerImpl();

export { modelStateManager };
export type { IModelStateManagerService };
