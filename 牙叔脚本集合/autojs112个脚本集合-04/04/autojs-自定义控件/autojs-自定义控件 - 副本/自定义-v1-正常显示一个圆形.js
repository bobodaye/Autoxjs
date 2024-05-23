"ui";

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
      defineMethod.call(this, view.getChildAt(0).getChildAt(0));
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
      view.setBackgroundDrawable(bgdb);
    }
  }
  CustomView.prototype.render = function () {
    return (
      <HorizontalScrollView bg="#ff0000" h="300dp" w="300dp">
        <card id="ball" w="200dp" h="200dp" cardCornerRadius="100" cardElevation="2dp">
          <View w="200dp" h="200dp" bg="#f0ffff"></View>
        </card>
      </HorizontalScrollView>
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
