"ui";

/*
 * @Author: 家
 * @QQ: 203118908
 * @QQ交流群: 1019208967
 * @bilibili: 晓宇小凡
 * @versioin: 1.0
 * @Date: 2020-10-20 19:36:50
 * @LastEditTime: 2020-10-21 18:08:24
 * @LastEditors: 家
 * @Description: 自定义控件
 * @学习格言: 即用即学, 即学即用
 */

/*
aj的自定义控件有三种属性

1. 布局: 由 TestButton.prototype.render 设置
2. 控件的xml中的属性: 由 TestButton.prototype.defineAttr 设置, defineAttr有三个参数: attrName, getter, setter
3. 点击事件: 依靠的是控件原本的点击事件
  1. 添加一个属性, 用来实施点击后要执行的动作       TestButton.prototype.clickAction = () => {};
  2. 在生命周期onFinishInflation里面, 监听控件的点击事件, 在点击事件中, 执行clickAction
  TestButton.prototype.onFinishInflation = function (view) {
    view.btn.on("click", () => {
      log("click");
      clickAction()
    });
  };

生命周期: onViewCreated, onFinishInflation
*/

(function () {
  util.extend(TestButton, ui.Widget);
  function TestButton() {
    ui.Widget.call(this);
    this.defineAttr("text", (view, attr, value, defineSetter) => {
      view.btn.setText(value);
      this.text = value;
      log("设置了文本: " + value);
      log("this.text = ");
      log(this.text);
    });
    this.defineAttr(
      "colour",
      (view, name, defaultGetter) => {
        return this.colour;
      },
      (view, name, value, defaultSetter) => {
        this.colour = value;
        view.btn.attr("backgroundTint", value);
      }
    );
  }
  TestButton.prototype.render = function () {
    return (
      <vertical>
        <button id="空按钮" text="空按钮"></button>
        <button id="btn" text="测试按钮"></button>
      </vertical>
    );
  };
  TestButton.prototype.propertyTesting = "this is propertyTesting value!";
  TestButton.prototype.actionTesting = function () {
    log("this is actionTesting!");
  };
  TestButton.prototype.clickAction = () => {
    toastLog("clickAction");
  };
  TestButton.prototype.findViewByName = function (name) {
    toastLog("findViewByName");
    // 禁止使用箭头函数
    // 此处this可以认为是TestButton, 或者TestButton.prototype, 都差不多
    // TODO: this.view相当于是ui, name就是控件id
    return this.view[name];
  };

  TestButton.prototype.onViewCreated = function (view) {
    log("onViewCreated");
    log(view.widget.propertyTesting);
  };
  TestButton.prototype.onFinishInflation = function (view) {
    log("onFinishInflation");
    log(view);
    // log(view.btn);
    view.btn.on("click", () => {
      log("click");
      log(view.widget.propertyTesting);
      view.widget.clickAction();
      view.btn.attr("backgroundTint", "#f0f0ff");
      setTimeout(function () {
        view.widget.actionTesting();
      }, 2000);
    });
  };

  ui.registerWidget("test-button", TestButton);
  return TestButton;
})();
ui.layout(
  <vertical gravity="center">
    <test-button id="testButton" text="aaaaaaaaa" colour="#ff0000"></test-button>
  </vertical>
);

// widget此处可以当做prototype, 这样就可以和自定义控件中的属性对应上了
ui.testButton.widget.clickAction = function () {
  let view = ui.testButton.widget.findViewByName("空按钮");
  view.attr("bg", "#ff000f");
  view.setText("红色足力健");
  view.setTextSize("30");
  ui.testButton.widget.findViewByName("btn").setText("该怎么形容你最体贴");
};
