"ui";
engines.all().map((ScriptEngine) => {
  if (engines.myEngine().toString() !== ScriptEngine.toString()) {
    ScriptEngine.forceStop();
  }
});
importClass(android.graphics.PaintFlagsDrawFilter);
importClass(android.graphics.Color);
importClass(android.animation.ObjectAnimator);
importClass(android.animation.AnimatorListenerAdapter);
(function () {
  util.extend(CustomView, ui.Widget);
  function CustomView() {
    ui.Widget.call(this);
    let labelPaint = new com.stardust.autojs.core.graphics.Paint();
    let labelRect = new android.graphics.RectF();
    labelPaint.setAntiAlias(true);
    labelPaint.setStrokeWidth(10); //设置画笔宽度
    labelPaint.setStyle(android.graphics.Paint.Style.FILL);
    labelRect.set(10, 10, 400, 400);
    let tipHeight = 500;
    let tipWidth = 50;
    let 文字颜色 = colors.parseColor("#ffff0000");
    let mTextColorLight = colors.parseColor("#ff000000");
    let 轨道颜色 = colors.parseColor("#ffd5d5d5");
    let 轨道进度条颜色 = colors.parseColor("#ff0000ff");
    let scope = this;
    this.defineAttr("w", (view, attr, value, defineSetter) => {
      view.attr("w", value);
    });
    this.defineAttr("h", (view, attr, value, defineSetter) => {
      view.attr("h", value);
    });
    this.defineAttr("textColorLight", (view, attr, value, defineSetter) => {
      mTextColorLight = colors.parseColor(value);
    });
    this.defineAttr("textColorNormal", (view, attr, value, defineSetter) => {
      mTextColorNormal = colors.parseColor(value);
    });
    this.defineAttr("cursorColor", (view, attr, value, defineSetter) => {
      轨道颜色 = colors.parseColor(value);
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
        移动小球(view.ball);
        view.widget.clickAction();
      });

      function 移动小球(ballView) {
        let ball = 获取小球属性(ballView);
        // setTranslationY
        let animator;
        let deltaX =
          ball.parentViewWidth - ball.ballViewWidth - ball.parentViewPaddingRight - ball.parentViewPaddingLeft;
        if (ball.ballViewX > ball.parentViewWidth / 2) {
          animator = ObjectAnimator.ofFloat(ballView, "translationX", deltaX, 0);
        } else {
          animator = ObjectAnimator.ofFloat(ballView, "translationX", 0, deltaX);
        }
        ball.deltaX = deltaX;
        animator.setDuration(1000); //动画时间
        // Android自定义View如何实现加载进度条效果
        // https://www.yisu.com/zixun/207720.html
        animator.addListener(
          new AnimatorListenerAdapter({
            onAnimationEnd: function (animation) {
              log("animation end");
              获取小球属性(ballView);
            },
          })
        );
        animator.addUpdateListener(
          new android.animation.ValueAnimator.AnimatorUpdateListener({
            onAnimationUpdate: function (valueAnimator) {
              /**
               * 根据进度绘制圆角矩形
               */
              轨道绘制进度条(ballView.getParent(), valueAnimator, ball);
            },
          })
        );

        animator.start();
      }

      view.post(function () {
        轨道设置圆角(view);
      });
      // defineMethod.call(this, view.getChildAt(0).getChildAt(0));
    };
    function 获取小球属性(ballView) {
      let parentView = ballView.getParent();
      let parentViewWidth = parentView.getWidth();
      let parentViewHeight = parentView.getHeight();
      let parentViewLeft = parentView.getLeft();
      let parentViewRight = parentView.getRight();
      let parentViewX = parentView.getX();
      let parentViewY = parentView.getY();
      let parentViewPaddingLeft = parentView.getPaddingLeft();
      let parentViewPaddingRight = parentView.getPaddingRight();

      let ballViewWidth = ballView.getWidth();
      let ballViewHeight = ballView.getHeight();
      let ballViewLeft = ballView.getLeft();
      let ballViewRight = ballView.getRight();
      let ballViewX = ballView.getX();
      let ballViewY = ballView.getY();

      let ball = {
        parentViewWidth: parentViewWidth,
        parentViewHeight: parentViewHeight,
        parentViewLeft: parentViewLeft,
        parentViewRight: parentViewRight,
        parentViewX: parentViewX,
        parentViewY: parentViewY,
        parentViewPaddingRight: parentViewPaddingRight,
        parentViewPaddingLeft: parentViewPaddingLeft,
        ballViewWidth: ballViewWidth,
        ballViewHeight: ballViewHeight,
        ballViewLeft: ballViewLeft,
        ballViewRight: ballViewRight,
        ballViewX: ballViewX,
        ballViewY: ballViewY,
      };
      log(ball);
      return ball;
    }

    function 轨道绘制进度条(view, animation, ball) {
      进度 = animation.getAnimatedValue();
      log(进度);
      // 滚动栏高度 = view.getMeasuredHeight();
      // 滚动栏宽度 = view.getMeasuredWidth();
      // 进度 =
      //   原始进度 +
      //   ball.ballViewWidth *
      //     (原始进度 /
      //       (ball.parentViewWidth - ball.ballViewWidth - ball.parentViewPaddingRight - ball.parentViewPaddingLeft)) +
      //   ball.parentViewPaddingRight +
      //   ball.parentViewPaddingLeft;
      var 圆角背景 = new android.graphics.drawable.Drawable({
        draw: function (canvas) {
          labelPaint.setColor(轨道颜色);
          labelRect.set(0, 0, ball.parentViewWidth, ball.parentViewHeight);
          canvas.setDrawFilter(new PaintFlagsDrawFilter(0, Paint.ANTI_ALIAS_FLAG | Paint.FILTER_BITMAP_FLAG));
          canvas.drawRoundRect(labelRect, 80, 80, labelPaint);
          labelPaint.setColor(轨道进度条颜色);
          canvas.drawRoundRect(
            0,
            0,
            进度 +
              (ball.ballViewWidth + ball.parentViewPaddingRight + ball.parentViewPaddingLeft) * (进度 / ball.deltaX),
            ball.parentViewHeight,
            80,
            80,
            labelPaint
          );

          // 文字颜色
          labelPaint.setColor(android.graphics.Color.RED);
          labelPaint.setTextAlign(Paint.Align.CENTER);
          labelPaint.setTextSize(80);
          fontMetricsInt = labelPaint.getFontMetricsInt();
          baseline = labelRect.centerY() - (fontMetricsInt.top + fontMetricsInt.bottom) / 2;
          // Android Canvas drawText()文字居中
          // https://blog.csdn.net/willway_wang/article/details/81414347
          canvas.drawText("牙叔教程", labelRect.centerX(), baseline, labelPaint);
        },
      });
      view.setBackgroundDrawable(圆角背景);
    }
    function 轨道设置圆角(view) {
      滚动栏高度 = view.getMeasuredHeight();
      滚动栏宽度 = view.getMeasuredWidth();
      log("滚动栏高度 =");
      log(滚动栏高度);
      log("滚动栏宽度 =");
      log(滚动栏宽度);

      // var 圆角背景 = new android.graphics.drawable.Drawable({
      //   draw: function (canvas) {
      //     canvas.drawARGB(colors.alpha(bgColor), colors.red(bgColor), colors.green(bgColor), colors.blue(bgColor));
      //     labelPaint.setColor(轨道颜色);
      //     labelRect.set(0, 0, 滚动栏宽度, 滚动栏高度);
      //     canvas.drawRoundRect(labelRect, 80, 80, labelPaint);
      //   },
      // });
      var 圆角背景 = new android.graphics.drawable.Drawable({
        draw: function (canvas) {
          labelPaint.setColor(轨道颜色);
          labelRect.set(0, 0, 滚动栏宽度, 滚动栏高度);
          canvas.setDrawFilter(new PaintFlagsDrawFilter(0, Paint.ANTI_ALIAS_FLAG | Paint.FILTER_BITMAP_FLAG));
          canvas.drawRoundRect(labelRect, 80, 80, labelPaint);
          // 文字颜色
          labelPaint.setColor(android.graphics.Color.RED);
          labelPaint.setTextAlign(Paint.Align.CENTER);
          labelPaint.setTextSize(80);
          fontMetricsInt = labelPaint.getFontMetricsInt();
          log("fontMetricsInt");
          log(fontMetricsInt);
          baseline = labelRect.centerY() - (fontMetricsInt.top + fontMetricsInt.bottom) / 2;
          // Android Canvas drawText()文字居中
          // https://blog.csdn.net/willway_wang/article/details/81414347
          canvas.drawText("牙叔教程", labelRect.centerX(), baseline, labelPaint);
        },
      });
      view.setBackgroundDrawable(圆角背景);
    }
    function defineMethod(view) {
      log(arguments.callee.name);
      log("view");
      log(view); // CardView
      var bgdb = new android.graphics.drawable.Drawable({
        draw: function (canvas) {
          canvas.drawARGB(colors.alpha(bgColor), colors.red(bgColor), colors.green(bgColor), colors.blue(bgColor));
          labelPaint.setColor(轨道颜色);
          canvas.drawRoundRect(labelRect, tipHeight / 2, tipHeight / 2, labelPaint);
        },
      });
      // view.setBackgroundDrawable(bgdb);
    }
  }
  CustomView.prototype.render = function () {
    return (
      <LinearLayout padding="2 2 2 2" h="60dp" w="300dp" gravity="center_vertical">
        <card id="ball" w="53dp" h="53dp" cardCornerRadius="25dp" cardElevation="3dp">
          <View layout_width="53dp" layout_height="53dp"></View>
        </card>
      </LinearLayout>
    );
  };
  ui.registerWidget("custom-view", CustomView);
  return CustomView;
})();
ui.layout(
  <vertical gravity="center">
    <custom-view id="customView"></custom-view>
  </vertical>
);
/* ----------------------自定义函数---------------------------------------------------- */
function rndColor() {
  return colors.rgb(random(0, 255), random(0, 255), random(0, 255));
}
