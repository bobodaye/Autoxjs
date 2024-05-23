/*
 * @version: 1.0
 * @Date: 2021-09-03 14:46:44
 * @LastEditTime: 2021-09-27 17:45:24
 * @LastEditors: 牙叔
 * @Description:
 * @FilePath: \autojs-test\autojs桌面图标的隐藏和显示.js
 * @名人名言: 牙叔教程 简单易懂
 * @bilibili: 牙叔教程
 * @公众号: 牙叔教程
 * @QQ群: 747748653
 */
importClass(android.content.ComponentName);
importClass(android.content.pm.PackageManager);

// hide();
unhide();

function hide() {
  let p = context.getPackageManager();
  let componentName = new ComponentName(context.getPackageName(), "org.autojs.autojs.ui.splash.SplashActivity");
  p.setComponentEnabledSetting(
    componentName,
    PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
    PackageManager.DONT_KILL_APP
  );
}

function unhide() {
  let p = context.getPackageManager();
  let componentName = new ComponentName(context.getPackageName(), "org.autojs.autojs.ui.splash.SplashActivity");
  p.setComponentEnabledSetting(
    componentName,
    PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
    PackageManager.DONT_KILL_APP
  );
}