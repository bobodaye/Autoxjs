/*
 * @version: 1.0
 * @Date: 2021-05-01 10:20:34
 * @LastEditTime: 2021-09-27 16:56:55
 * @LastEditors: 牙叔
 * @Description:
 * @FilePath: \autojs-test\自动切换输入法.js
 * @名人名言: 牙叔教程 简单易学
 * @bilibili: 牙叔教程
 * @公众号: 牙叔教程
 * @QQ群: 747748653
 */

importClass("android.provider.Settings");

let 默认输入法名字 = 获取默认输入法名字();

切换IME输入法();
sleep(2000);
切换默认输入法(默认输入法名字);

function 切换IME输入法() {
  let imm = context.getSystemService(context.INPUT_METHOD_SERVICE);
  imm.showInputMethodPicker();
  let keyword = "IME";
  let view = textContains(keyword).visibleToUser(true).boundsInside(0, 0, device.width, device.height).findOne();
  sleep(600);
  view = textContains(keyword).visibleToUser(true).boundsInside(0, 0, device.width, device.height).findOne();
  let rect = view.bounds();
  press(rect.centerX(), rect.centerY(), 100);
  sleep(600);
}
function 切换默认输入法(默认输入法名字) {
  let imm = context.getSystemService(context.INPUT_METHOD_SERVICE);
  imm.showInputMethodPicker();
  let keyword = 默认输入法名字;
  log("keyword = " + keyword);
  let view = textContains(keyword).visibleToUser(true).boundsInside(0, 0, device.width, device.height).findOne();
  sleep(600);
  view = textContains(keyword).visibleToUser(true).boundsInside(0, 0, device.width, device.height).findOne();
  let rect = view.bounds();
  press(rect.centerX(), rect.centerY(), 100);
  sleep(1000);
}

function 获取默认输入法名字() {
  let defaultPackageName = 获取默认输入法包名();
  let InputMethods = context.getSystemService(context.INPUT_METHOD_SERVICE).getEnabledInputMethodList();
  for (let i = 0; i < InputMethods.size(); i++) {
    let inputMethod = InputMethods.get(i);
    let currentPackageName = inputMethod.getPackageName();
    if (currentPackageName === defaultPackageName) {
      return inputMethod.loadLabel(context.getPackageManager());
    }
  }
  throw new Error("没有找到默认的输入法");
}
function 获取默认输入法包名() {
  let defaultInputMethod = null;
  let inputComponent = Settings.Secure.getString(context.getContentResolver(), Settings.Secure.DEFAULT_INPUT_METHOD);
  defaultInputMethod = inputComponent.substring(0, inputComponent.indexOf("/"));
  return defaultInputMethod;
}