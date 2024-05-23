// 请授予无障碍, 为了自动点击确认按钮
for (var i = 0; i < 20; i++) {
  importClass(java.io.FileInputStream);

  if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
    log("本代码仅在华为安卓8手机上测试通过");
  } else {
    log("需要安卓8(包含)以上");
  }
  TAG = "aaaaaaaa";

  log(context.SHORTCUT_SERVICE);

  shortcutManager = context.getSystemService(context.SHORTCUT_SERVICE);
  requestPinShortcutSupported = shortcutManager.isRequestPinShortcutSupported();
  log(TAG, "启动器是否支持固定快捷方式: " + requestPinShortcutSupported);

  importClass(android.content.pm.ShortcutInfo);
  importClass(android.app.PendingIntent);
  if (requestPinShortcutSupported) {
    var shortcutInfoIntent = new Intent();
    shortcutInfoIntent.setAction("android.settings.ACCESSIBILITY_SETTINGS");

    // function getResID(name, type) {
    //   return context.getResources().getIdentifier(name, type, context.getPackageName());
    // }
    // icon=getResID('ic_person_black_48dp', 'drawable')
    importClass(android.graphics.BitmapFactory);
    importClass(android.graphics.drawable.Icon);
    function getIcon(icon_path) {
      let bitmap = BitmapFactory.decodeStream(new FileInputStream(icon_path));
      return Icon.createWithBitmap(bitmap);
    }
    name = "设置";
    icon_path = "/sdcard/" + name + ".jpg";
    icon = getIcon(icon_path);

    let randomNum = random(1000, 9999).toString();
    log(randomNum);
    let info = new ShortcutInfo.Builder(context, randomNum)
      .setIcon(icon)
      .setShortLabel("短名" + randomNum)
      .setLongLabel("长名" + randomNum)
      .setIntent(shortcutInfoIntent)
      .build();

    //当添加快捷方式的确认弹框弹出来时，将被回调CallBackReceiver里面的onReceive方法
    let secondIntent = new Intent();
    secondIntent.setAction("android.settings.CAPTIONING_SETTINGS");

    shortcutCallbackIntent = PendingIntent.getBroadcast(context, 0, secondIntent, PendingIntent.FLAG_UPDATE_CURRENT);

    shortcutManager.requestPinShortcut(info, shortcutCallbackIntent.getIntentSender());

    sleep(1000);
    let view = text("添加").visibleToUser(true).boundsInside(0, 0, device.width, device.height).findOne();
    view.click();
  }
  break;
}