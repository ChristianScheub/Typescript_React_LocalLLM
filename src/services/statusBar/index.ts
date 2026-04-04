import type { IStatusBarService } from "@services/statusBar/IStatusBarService";
import { configureStatusBar } from "@services/statusBar/logic/configureStatusBar";

export const statusBarService: IStatusBarService = {
  configureStatusBar,
};

export type { IStatusBarService };
