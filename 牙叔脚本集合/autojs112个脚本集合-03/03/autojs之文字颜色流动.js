"ui";
importClass(android.graphics.Color);
importClass(android.graphics.LinearGradient);
importClass(android.graphics.Shader);
importClass(android.graphics.Matrix);
importClass(android.animation.ValueAnimator);

ui.layout(
  <vertical margin="30">
    <text id="textView" w="wrap_content" textSize="24sp">
      作者: 牙叔 作者: 牙叔 作者: 牙叔 作者: 牙叔 作者: 牙叔 作者: 牙叔 作者: 牙叔 作者: 牙叔 作者: 牙叔 作者: 牙叔
    </text>
    <button id="btn" textSize="24sp">
      作者: 牙叔 作者: 牙叔 作者: 牙叔 作者: 牙叔 作者: 牙叔 作者: 牙叔 作者: 牙叔 作者: 牙叔 作者: 牙叔 作者: 牙叔
    </button>
  </vertical>
);
let animatorList = [];
setTimeout(function () {
  setTextPaintShaderGradientColor(ui.textView);
  setTimeout(function () {
    setTextPaintShaderGradientColor(ui.btn);
  }, random(200, 1000));
}, 10);

events.on("exit", function () {
  var len = animatorList.length;
  for (var i = 0; i < len; i++) {
    animatorList[i].cancel();
    log("退出脚本, 中断动画: animator" + i);
  }
});
// ========================自定义函数======================================================================
function setTextPaintShaderGradientColor(view) {
  var color1 = "#cc00ff";
  var color2 = "#ff9900";
  var color3 = "#99ff00";
  let colorArr = util.java.array("int", 3);
  colorArr[0] = colors.parseColor(color1);
  colorArr[1] = colors.parseColor(color2);
  colorArr[2] = colors.parseColor(color3);
  let wordWidth = new Packages.java.lang.Float(view.getPaint().getTextSize() * view.getText().length);
  log("wordWidth = " + wordWidth);
  wordWidth = parseInt(Math.min(view.getWidth(), wordWidth));
  log("wordWidth = " + wordWidth);
  let mLinearGradient = new LinearGradient(0, 0, wordWidth, 1, colorArr, [0, 0.5, 1], Shader.TileMode.REPEAT);
  view.getPaint().setShader(mLinearGradient);
  view.invalidate();
  setTimeout(function () {
    createAnimator(view, mLinearGradient, wordWidth);
  }, 20);
}

function createAnimator(view, bgLinearGradient) {
  let viewWidth = view.getWidth();
  let wordWidth = new Packages.java.lang.Float(view.getPaint().getTextSize() * view.getText().length);
  let maxNum = Math.min(viewWidth, wordWidth);
  animator = ValueAnimator.ofInt(0, maxNum);
  let matrix = new Matrix();
  let mDx;
  animator.addUpdateListener(
    new ValueAnimator.AnimatorUpdateListener({
      onAnimationUpdate: function (animation) {
        mDx = animation.getAnimatedValue();
        matrix.setTranslate(mDx, 0);
        bgLinearGradient = view.getPaint().getShader();
        bgLinearGradient.setLocalMatrix(matrix);
        view.invalidate();
      },
    })
  );
  animator.setRepeatMode(ValueAnimator.RESTART);
  animator.setRepeatCount(ValueAnimator.INFINITE);
  animator.setStartDelay(500);
  animator.setDuration(3000);
  animator.start();
  animatorList.push(animator);
}