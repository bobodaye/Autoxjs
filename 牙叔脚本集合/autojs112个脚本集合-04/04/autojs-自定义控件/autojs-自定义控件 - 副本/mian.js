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
importClass(android.util.TypedValue);

(function () {
  util.extend(CustomView, ui.Widget);
  const displayMetrics = context.getResources().getDisplayMetrics();
  const all_2Px = (value) => {
    if (value.indexOf("px") >= 0) {
      let result = value.replace("px", "");
      return parseInt(result);
    } else if (value.indexOf("dp") >= 0) {
      let result = parseFloat(value.replace("dp", ""));
      result = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, result, displayMetrics);
      return parseInt(result);
    } else if (value.indexOf("in") >= 0) {
      let result = parseFloat(value.replace("in", ""));
      result = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_IN, result, displayMetrics);
      return parseInt(result);
    } else if (value.indexOf("mm") >= 0) {
      let result = parseFloat(value.replace("mm", ""));
      result = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_MM, result, displayMetrics);
      return parseInt(result);
    } else if (value.indexOf("pt") >= 0) {
      let result = parseFloat(value.replace("pt", ""));
      result = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_PT, result, displayMetrics);
      return parseInt(result);
    } else if (value.indexOf("sp") >= 0) {
      let result = parseFloat(value.replace("sp", ""));
      result = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_SP, result, displayMetrics);
      return parseInt(result);
    } else {
      return parseInt(value);
    }
  };
  function CustomView() {
    ui.Widget.call(this);
    let labelPaint = new com.stardust.autojs.core.graphics.Paint();
    let labelRect = new android.graphics.RectF();
    labelPaint.setAntiAlias(true);
    let labelPaintWidth = 2;
    let halfLabelPaintWidth = 2;
    labelPaint.setStrokeWidth(labelPaintWidth); //设置画笔宽度
    labelPaint.setStyle(android.graphics.Paint.Style.FILL);
    labelRect.set(10, 10, 400, 400);
    let textSize = 80;
    let 文字颜色 = colors.parseColor("#ffff0000");
    let 轨道颜色 = colors.parseColor("#ffd5d5d5");
    let 轨道进度条颜色 = colors.parseColor("#ff0000ff");
    let trackRadius = 80;
    let ballRadius = 50;
    let ballColor = colors.parseColor("#795548");
    let scope = this;
    this.defineAttr("textColor", (view, attr, value, defineSetter) => {
      文字颜色 = colors.parseColor(value);
    });
    this.defineAttr("w", (view, attr, value, defineSetter) => {
      view.attr("w", value);
    });
    this.defineAttr("h", (view, attr, value, defineSetter) => {
      view.attr("h", value);
    });
    this.defineAttr("trackRadius", (view, attr, value, defineSetter) => {
      trackRadius = all_2Px(value);
    });
    this.defineAttr("ballRadius", (view, attr, value, defineSetter) => {
      ballRadius = all_2Px(value);
    });
    this.defineAttr("textSize", (view, attr, value, defineSetter) => {
      textSize = all_2Px(value);
    });
    this.defineAttr("trackColor", (view, attr, value, defineSetter) => {
      轨道颜色 = colors.parseColor(value);
    });
    this.defineAttr("progressBarColor", (view, attr, value, defineSetter) => {
      轨道进度条颜色 = colors.parseColor(value);
    });
    this.defineAttr("ballColor", (view, attr, value, defineSetter) => {
      ballColor = colors.parseColor(value);
      view.getChildAt(0).getChildAt(0).setBackgroundColor(ballColor);
    });
    this.clickAction = () => {
      toastLog("clickAction");
    };
    this.onViewCreated = function (view) {
      log("onViewCreated");
    };
    this.onFinishInflation = function (view) {
      log("onFinishInflation");
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
        if (ball.ballViewX + ball.ballViewWidth / 2 > ball.parentViewWidth / 2) {
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
        setBallRadius(view);
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
      let 进度 = animation.getAnimatedValue();
      var 圆角背景 = new android.graphics.drawable.Drawable({
        draw: function (canvas) {
          labelPaint.setColor(轨道颜色);
          // labelRect.set(0, 0, ball.parentViewWidth, ball.parentViewHeight);
          labelRect.set(
            halfLabelPaintWidth,
            halfLabelPaintWidth,
            ball.parentViewWidth - halfLabelPaintWidth,
            ball.parentViewHeight - halfLabelPaintWidth
          );
          // labelRect.set(ball.parentViewPaddingLeft, 0, ball.parentViewWidth-ball.parentViewPaddingRight, ball.parentViewHeight);
          canvas.setDrawFilter(new PaintFlagsDrawFilter(0, Paint.ANTI_ALIAS_FLAG | Paint.FILTER_BITMAP_FLAG));
          canvas.drawRoundRect(labelRect, trackRadius, trackRadius, labelPaint);
          labelPaint.setColor(轨道进度条颜色);
          canvas.drawRoundRect(
            0,
            0,
            进度 +
              (ball.ballViewWidth + ball.parentViewPaddingRight + ball.parentViewPaddingLeft) * (进度 / ball.deltaX),
            ball.parentViewHeight,
            trackRadius,
            trackRadius,
            labelPaint
          );

          // 文字颜色
          labelPaint.setColor(文字颜色);
          labelPaint.setTextAlign(Paint.Align.CENTER);
          labelPaint.setTextSize(textSize);
          fontMetricsInt = labelPaint.getFontMetricsInt();
          baseline = labelRect.centerY() - (fontMetricsInt.top + fontMetricsInt.bottom) / 2;
          // Android Canvas drawText()文字居中
          // https://blog.csdn.net/willway_wang/article/details/81414347
          canvas.drawText("牙叔教程", labelRect.centerX(), baseline, labelPaint);
        },
      });
      view.setBackgroundDrawable(圆角背景);
    }
    function setBallRadius(view) {
      let ballView = view.getChildAt(0);
      ballView.attr("w", ballRadius);
      ballView.attr("h", ballRadius);
      ballView.attr("cardCornerRadius", ballRadius / 2);
    }
    function 轨道设置圆角(view) {
      let 滚动栏高度 = view.getMeasuredHeight();
      let 滚动栏宽度 = view.getMeasuredWidth();

      var 圆角背景 = new android.graphics.drawable.Drawable({
        draw: function (canvas) {
          labelPaint.setColor(轨道颜色);
          // labelRect.set(0, 0, 滚动栏宽度, 滚动栏高度);

          labelRect.set(
            halfLabelPaintWidth,
            halfLabelPaintWidth,
            滚动栏宽度 - halfLabelPaintWidth,
            滚动栏高度 - halfLabelPaintWidth
          );

          canvas.setDrawFilter(new PaintFlagsDrawFilter(0, Paint.ANTI_ALIAS_FLAG | Paint.FILTER_BITMAP_FLAG));
          canvas.drawRoundRect(labelRect, trackRadius, trackRadius, labelPaint);
          // 文字颜色
          labelPaint.setColor(文字颜色);
          labelPaint.setTextAlign(Paint.Align.CENTER);
          labelPaint.setTextSize(textSize);
          fontMetricsInt = labelPaint.getFontMetricsInt();
          let baseline = labelRect.centerY() - (fontMetricsInt.top + fontMetricsInt.bottom) / 2;
          // Android Canvas drawText()文字居中
          // https://blog.csdn.net/willway_wang/article/details/81414347
          canvas.drawText("牙叔教程", labelRect.centerX(), baseline, labelPaint);
        },
      });
      view.setBackgroundDrawable(圆角背景);
    }
  }
  CustomView.prototype.render = function () {
    return (
      <LinearLayout margin="6 6 6 6" padding="2 2 2 2" h="60dp" w="300dp" gravity="center_vertical">
        <card id="ball" w="53dp" h="53dp" cardCornerRadius="25dp" cardElevation="3dp">
          <View layout_width="match_parent" layout_height="match_parent"></View>
        </card>
      </LinearLayout>
    );
  };
  ui.registerWidget("custom-view", CustomView);
  return CustomView;
})();
ui.layout(
  <vertical gravity="center">
    <text textSize="30sp" text="牙叔教程" textStyle="bold" w="*" gravity="center"></text>
    <custom-view
      id="customView"
      textColor="#5e35b1"
      trackColor="#0091ea"
      progressBarColor="#ffeb3b"
      ballColor="#ff8a65"
      w="200dp"
      h="80dp"
      textSize="30sp"
      trackRadius="60"
      ballRadius="60"
    ></custom-view>
    <custom-view
      textColor="#eccc68"
      trackColor="#ff7f50"
      progressBarColor="#ff6b81"
      ballColor="#a4b0be"
      w="300dp"
      h="70dp"
      ballRadius="60"
      textSize="30sp"
      trackRadius="60"
    ></custom-view>
    <custom-view
      textColor="#ffa502"
      trackColor="#ff6348"
      progressBarColor="#ff4757"
      ballColor="#3742fa"
      w="300dp"
      h="50dp"
      ballRadius="30"
      textSize="20sp"
      trackRadius="60"
    ></custom-view>
  </vertical>
);
/* ----------------------自定义函数---------------------------------------------------- */
function rndColor() {
  return colors.rgb(random(0, 255), random(0, 255), random(0, 255));
}
