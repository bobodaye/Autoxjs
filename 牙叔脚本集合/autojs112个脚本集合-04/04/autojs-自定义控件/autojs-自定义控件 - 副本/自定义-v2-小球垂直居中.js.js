"ui";
engines.all().map((ScriptEngine) => {
  if (engines.myEngine().toString() !== ScriptEngine.toString()) {
    ScriptEngine.forceStop();
  }
});
(function () {
  util.extend(CustomView, ui.Widget);
  function CustomView() {
    ui.Widget.call(this);
    let labelPaint = new com.stardust.autojs.core.graphics.Paint();
    let labelRect = new android.graphics.RectF();
    labelPaint.setAntiAlias(true);
    labelPaint.setStyle(android.graphics.Paint.Style.FILL);
    labelRect.set(10, 10, 40, 40);
    let tipHeight = 50;
    let tipWidth = 50;
    let bgColor = colors.parseColor("#0000ff00");
    let mTextColorNormal = colors.parseColor("#88000000");
    let mTextColorLight = colors.parseColor("#ff000000");
    let mCursorColor = colors.parseColor("#55000000");
    let scope = this;
    this.defineAttr("w", (view, attr, value, defineSetter) => {
      view.attr("w", value);
    });
    this.defineAttr("h", (view, attr, value, defineSetter) => {
      view.attr("h", value);
    });
    this.defineAttr("backgroundColor", (view, attr, value, defineSetter) => {
      bgColor = colors.parseColor(value);
    });
    this.defineAttr("textColorLight", (view, attr, value, defineSetter) => {
      mTextColorLight = colors.parseColor(value);
    });
    this.defineAttr("textColorNormal", (view, attr, value, defineSetter) => {
      mTextColorNormal = colors.parseColor(value);
    });
    this.defineAttr("cursorColor", (view, attr, value, defineSetter) => {
      mCursorColor = colors.parseColor(value);
    });
    this.clickAction = () => {
      toastLog("clickAction");
    };
    this.onViewCreated = function (view) {
      log("onViewCreated");
    };
    this.onFinishInflation = function (view) {
      log("onFinishInflation");
      log(view); // HorizontalScrollView
      view.setHorizontalScrollBarEnabled(false);
      view.setOverScrollMode(android.view.View.OVER_SCROLL_NEVER);
      view.ball.on("click", () => {
        log("click");
        view.widget.clickAction();
      });
      // defineMethod.call(this, view.getChildAt(0).getChildAt(0));
    };
    function defineMethod(view) {
      log(arguments.callee.name);
      log("view");
      log(view); // CardView
      var bgdb = new android.graphics.drawable.Drawable({
        draw: function (canvas) {
          canvas.drawARGB(colors.alpha(bgColor), colors.red(bgColor), colors.green(bgColor), colors.blue(bgColor));
          labelPaint.setColor(mCursorColor);
          canvas.drawRoundRect(labelRect, tipHeight / 2, tipHeight / 2, labelPaint);
        },
      });
      // view.setBackgroundDrawable(bgdb);
    }
  }
  CustomView.prototype.render = function () {
    return (
      <card h="60dp" w="300dp" cardCornerRadius="30dp">
        <HorizontalScrollView bg="#d5d5d5" padding='1 1 1 1' h="60dp" w="300dp" gravity="center_vertical" scrollbars="none">
          <LinearLayout bg="#0000ff" gravity="center_vertical">
            <card id="ball" w="50dp" h="50dp" cardCornerRadius="25dp">
              <View layout_width="50dp" layout_height="50dp"></View>
            </card>
          </LinearLayout>
        </HorizontalScrollView>
      </card>
    );
  };
  ui.registerWidget("custom-view", CustomView);
  return CustomView;
})();
ui.layout(
  <vertical gravity="center">
    <custom-view id="customView" backgroundColor="#f0f0f0"></custom-view>
  </vertical>
);
log("ui.customView");
log(ui.customView);
// widget此处可以当做prototype, 这样就可以和自定义控件中的属性对应上了
ui.customView.clickAction = function () {
  log("ui.customView.widget.clickAction");
  log(ui.customView);
  // ui.customView.attr("bg", rndColor());
};
/* ----------------------自定义函数---------------------------------------------------- */
function rndColor() {
  return colors.rgb(random(0, 255), random(0, 255), random(0, 255));
}
