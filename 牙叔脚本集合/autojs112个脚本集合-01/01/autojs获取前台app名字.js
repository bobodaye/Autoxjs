/*
 * @version: 1.0
 * @Date: 2021-09-03 16:26:27
 * @LastEditTime: 2021-09-27 17:44:50
 * @LastEditors: 牙叔
 * @Description:
 * @FilePath: \autojs-test\autojs获取前台app名字.js
 * @名人名言: 牙叔教程 简单易懂
 * @bilibili: 牙叔教程
 * @公众号: 牙叔教程
 * @QQ群: 747748653
 */
importClass(android.provider.Settings);
importClass(java.lang.System);
importClass(android.app.AppOpsManager);
importClass(android.text.TextUtils);
importClass(java.util.Calendar);
importClass(java.util.ArrayList);
importClass(java.util.Collections);
importClass(java.util.Comparator);
importClass(android.content.pm.PackageManager);
importClass(android.app.usage.UsageStatsManager);
importClass(android.content.pm.ApplicationInfo);
importClass(java.util.TreeMap);
importClass(android.content.ComponentName);
importClass(android.app.usage.UsageStats);
importClass(android.app.usage.UsageEvents);

let r = getTopRunningTasks();
log(r);

var window = floaty.rawWindow(
  <vertical gravity="center">
    <text textSize="30sp" textColor="#bae637" bg="#8c8c8c">
      牙叔教程
    </text>
    <text id="content" textSize="50sp" textColor="#ff0000" bg="#8c8c8c">
      悬浮文字
    </text>
  </vertical>
);

ui.post(function () {
  let windowWidth = window.getWidth();
  let windowHeight = window.getHeight();
  let dw = device.width;
  let dh = device.height;
  let x = dw / 2 - windowWidth / 2;
  let y = dh / 3 - windowHeight / 2;
  window.setPosition(x, y);
});
setInterval(function () {
  let packageName = getTopRunningTasks();
  let appName = app.getAppName(packageName);
  ui.run(function () {
    window.content.setText(appName);
  });
}, 300);

function getTopRunningTasks() {
  let mUsageStatsManager = context.getSystemService("usagestats");
  let limitTime = 1000 * 60 * 15;
  let time = java.lang.System.currentTimeMillis();
  let usageEvents = mUsageStatsManager.queryEvents(time - limitTime, time);
  let arr = [];
  while (usageEvents.hasNextEvent()) {
    let e = new UsageEvents.Event();
    usageEvents.getNextEvent(e);
    if (e != null && e.getEventType() == 1) {
      arr.push(e);
    }
  }
  arr.sort(function (a, b) {
    if (a.getTimeStamp() - b.getTimeStamp() < 0) {
      return 1;
    } else if (a.getTimeStamp() - b.getTimeStamp() === 0) {
      return 0;
    } else {
      return -1;
    }
  });
  if (arr.length) {
    let e = arr[0];
    // e的属性
    // [
    //   "appStandbyBucket",
    //   "class",
    //   "className",
    //   "configuration",
    //   "equals",
    //   "eventType",
    //   "getAppStandbyBucket",
    //   "getClass",
    //   "getClassName",
    //   "getConfiguration",
    //   "getEventType",
    //   "getInstanceId",
    //   "getNotificationChannelId",
    //   "getPackageName",
    //   "getShortcutId",
    //   "getTaskRootClassName",
    //   "getTaskRootPackageName",
    //   "getTimeStamp",
    //   "hashCode",
    //   "instanceId",
    //   "instantApp",
    //   "isInstantApp",
    //   "notificationChannelId",
    //   "notify",
    //   "notifyAll",
    //   "packageName",
    //   "shortcutId",
    //   "taskRootClassName",
    //   "taskRootPackageName",
    //   "timeStamp",
    //   "toString",
    //   "wait",
    // ];
    return e.packageName;
  }
  return false;
}