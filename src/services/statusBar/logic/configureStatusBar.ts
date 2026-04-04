import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { NavigationBar } from "@capgo/capacitor-navigation-bar";
import type { IStatusBarService } from "@services/statusBar/IStatusBarService";

export const configureStatusBar: IStatusBarService['configureStatusBar'] = async () => {
  if (Capacitor.getPlatform() === 'android') {
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
    await NavigationBar.setNavigationBarColor({ color: '#FFFFFF', darkButtons: true });
  }
};
