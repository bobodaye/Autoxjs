function 申请查看使用情况的权限() {
  app.startActivity({
    action: "android.settings.USAGE_ACCESS_SETTINGS",
  });
}
function 申请查看使用情况的权限2() {
  let usageIntent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
  usageIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
  app.startActivity(usageIntent);
}
function 申请查看使用情况的权限3() {
  app.startActivity({
    packageName: "com.android.settings",
    className: "com.android.settings.Settings$AppUsageAccessSettingsActivity",
    data: "package:" + context.packageName.toString(),
  });
}


function 是否有查看使用情况的权限() {
  let appOps = context.getSystemService(context.APP_OPS_SERVICE);
  let mode = appOps.checkOpNoThrow(
    "android:get_" + "usage_stats",
    android.os.Process.myUid(),
    context.getPackageName()
  );
  return (granted = mode == AppOpsManager.MODE_ALLOWED);
}
function 是否有查看使用情况的权限2() {
  let ts = System.currentTimeMillis();
  let usageStatsManager = context.getSystemService("usagestats");
  let queryUsageStats = usageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_BEST, 0, ts);
  if (queryUsageStats == null || queryUsageStats.isEmpty()) {
    return false;
  }
  return true;
}

function 是否有有权查看使用情况的应用程序这个选项() {
  let packageManager = context.getPackageManager();
  let intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
  let list = packageManager.queryIntentActivities(intent, PackageManager.MATCH_DEFAULT_ONLY);
  return list.size() > 0;
}