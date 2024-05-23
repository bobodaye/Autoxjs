"ui";

if (!是否有悬浮窗权限()) {
  申请悬浮窗权限();
} else {
  toastLog("已有悬浮窗权限");
}

// if (!是否有悬浮窗权限2()) {
//   申请悬浮窗权限2();
// } else {
//   toastLog("已有悬浮窗权限");
// }

function 是否有悬浮窗权限() {
  return new android.provider.Settings().canDrawOverlays(context);
}

function 是否有悬浮窗权限2() {
  return floaty.checkPermission();
}

function 申请悬浮窗权限() {
  var intent = new Intent();
  intent.setAction("android.settings.action.MANAGE_OVERLAY_PERMISSION");
  // ui.emitter.on("activity_result", (req, res, intent) => {});
  activity.getEventEmitter().on("activity_result", function (requestCode, resultCode, intentData) {});
  activity.startActivityForResult(intent, 8000);
}

function 申请悬浮窗权限2() {
  app.startActivity({
    packageName: "com.android.settings",
    className: "com.android.settings.Settings$AppDrawOverlaySettingsActivity",
    data: "package:" + context.packageName.toString(),
  });
}