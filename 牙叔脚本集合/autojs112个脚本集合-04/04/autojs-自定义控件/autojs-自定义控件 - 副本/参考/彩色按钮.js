"ui";
importClass(android.graphics.Color);
importClass(android.graphics.drawable.GradientDrawable);
importClass(android.text.Spannable);
importClass(android.text.SpannableStringBuilder);
importClass(android.text.style.ForegroundColorSpan);
importClass(android.graphics.LinearGradient);
importClass(android.graphics.Shader);
importClass(android.graphics.Bitmap);
importClass("android.graphics.BitmapFactory");
importClass(android.graphics.BitmapShader);

ui.layout(
  <vertical margin="16 16 16 16">
    <text textStyle="bold" textSize="30sp" layout_weight="1" gravity="center">
      彩色按钮
    </text>
    <horizontal marginBottom="10">
      <text textSize="32sp" h="*" gravity="center" marginRight="20">
        图片
      </text>
      <text id="textView1" w="wrap_content" textSize="8sp" bg="#ff83acad">
        牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔
        牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔
        牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔
        牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔
        牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔
        牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔
        牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔
      </text>
    </horizontal>
    <horizontal marginBottom="10">
      <text textSize="32sp" h="*" gravity="center" marginRight="20">
        渐变色
      </text>
      <text id="textView2" w="wrap_content" textSize="24sp">
        牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔牙叔
      </text>
    </horizontal>
    <horizontal marginBottom="10">
      <text textSize="32sp" h="*" gravity="center" marginRight="20">
        多色
      </text>
      <text id="textView3" w="wrap_content" textSize="32sp">
        牙叔牙叔牙叔
      </text>
    </horizontal>
    <horizontal marginBottom="10">
      <text textSize="32sp" h="*" gravity="center" marginRight="20">
        圆角矩形
      </text>
      <text id="textView4" w="wrap_content" textSize="32sp" padding="6 6 6 6">
        牙叔牙叔牙叔
      </text>
    </horizontal>
    <horizontal marginBottom="10">
      <text textSize="24sp" h="*" gravity="center" marginRight="20">
        圆角矩形带边框
      </text>
      <text id="textView5" w="wrap_content" textSize="24sp" padding="6 6 6 6">
        牙叔牙叔牙叔
      </text>
    </horizontal>
    <horizontal marginBottom="10">
      <text id="textView6" w="wrap_content" textSize="24sp" textColor="#ffffff" marginRight="10" padding="6 6 6 6">
        纯色背景
      </text>
      <text id="textView7" w="wrap_content" textSize="24sp" textColor="#ffffff" marginRight="10" padding="6 6 6 6">
        圆角
      </text>
    </horizontal>
    <horizontal marginBottom="10">
      <text
        id="textView8"
        w="0"
        layout_weight="1"
        textSize="24sp"
        textColor="#ffffff"
        marginRight="10"
        padding="6 6 6 6"
      >
        渐变1
      </text>
      <text
        id="textView9"
        w="0"
        layout_weight="1"
        textSize="24sp"
        textColor="#ffffff"
        marginRight="10"
        padding="6 6 6 6"
      >
        渐变2
      </text>
      <text
        id="textView10"
        w="0"
        layout_weight="1"
        textSize="24sp"
        textColor="#ffffff"
        marginRight="10"
        padding="6 6 6 6"
      >
        渐变3
      </text>
    </horizontal>
    <horizontal marginBottom="10">
      <text
        id="textView11"
        w="0"
        layout_weight="1"
        textSize="24sp"
        textColor="#ffffff"
        marginRight="10"
        padding="6 6 6 6"
      >
        半径渐变
      </text>
      <text
        id="textView12"
        w="0"
        layout_weight="1"
        textSize="24sp"
        textColor="#000000"
        marginRight="10"
        padding="6 6 6 6"
      >
        虚线
      </text>
      <text
        id="textView13"
        w="0"
        layout_weight="1"
        textSize="24sp"
        textColor="#000000"
        marginRight="10"
        padding="6 6 6 6"
      >
        虚线矩形
      </text>
    </horizontal>
    <horizontal marginBottom="10">
      <text
        id="textView14"
        w="0"
        layout_weight="1"
        textSize="24sp"
        textColor="#ffffff"
        marginRight="10"
        padding="6 6 6 6"
        gravity="center"
      >
        不同的圆角
      </text>
    </horizontal>
    <text textStyle="bold" textSize="60sp" layout_weight="1" gravity="center">
      作者: 牙叔
    </text>
  </vertical>
);

let view;
// view = ui.textView1;
// setTextPaintShaderImg(view);
view = ui.textView2;
setTextPaintShaderGradientColor(view);
view = ui.textView3;
setTextPaintShaderMultipleColors(view);
view = ui.textView4;
setBackgroundRoundedRectangle(view);
view = ui.textView5;
setBackgroundRoundedRectangleWithBorder(view);
view = ui.textView6;
setBackgroundPureColour(view);
view = ui.textView7;
setBackgroundRoundRounded(view);
view = ui.textView8;
setBackgroundRoundGradientColor(view, "leftRight");
view = ui.textView9;
setBackgroundRoundGradientColor(view, "upDown");
view = ui.textView10;
setBackgroundRoundGradientColor(view, "topLeftToBottomRight");
view = ui.textView11;
setBackgroundRoundGradientColor(view, "RADIAL_GRADIENT");
view = ui.textView12;
setBackgroundRoundGradientDottedLine(view);
view = ui.textView13;
setBackgroundRoundGradientDottedRectangle(view);
view = ui.textView14;
setBackgroundRoundGradientCornerRadii(view);

// ====================自定义函数===============================================================================================

function setBackgroundRoundGradientCornerRadii(view) {
  gradientDrawable = new GradientDrawable();
  gradientDrawable.setShape(GradientDrawable.RECTANGLE);
  gradientDrawable.setColor(colors.parseColor("#7c5352"));
  gradientDrawable.setStroke(10, Color.BLUE);
  // gradientDrawable.setCornerRadius(10);
  //1、2两个参数表示左上角，3、4表示右上角，5、6表示右下角，7、8表示左下角

  let radiusArr = util.java.array("float", 8);
  radiusArr[0] = 10;
  radiusArr[1] = 20;
  radiusArr[2] = 30;
  radiusArr[3] = 40;
  radiusArr[4] = 50;
  radiusArr[5] = 60;
  radiusArr[6] = 70;
  radiusArr[7] = 80;
  gradientDrawable.setCornerRadii(radiusArr);
  gradientDrawable.setSize(50, 50);
  view.setBackground(gradientDrawable);
}

function setBackgroundRoundGradientDottedRectangle(view) {
  gradientDrawable = new GradientDrawable();
  gradientDrawable.setShape(GradientDrawable.LINEAR_GRADIENT);
  gradientDrawable.setStroke(10, Color.GREEN, 30, 30);
  view.setBackground(gradientDrawable);
}
function setBackgroundRoundGradientDottedLine(view) {
  view.setLayerType(android.view.View.LAYER_TYPE_SOFTWARE, null); //要显示虚线一定要关闭硬件加速
  gradientDrawable = new GradientDrawable();
  gradientDrawable.setShape(GradientDrawable.LINE);
  gradientDrawable.setStroke(8, Color.BLACK, 20, 10); //第一个参数为线的宽度  第二个参数是线的颜色 第三个参数是虚线段的长度 第四个参数是虚线段之间的间距长度
  view.setBackground(gradientDrawable);
}

function setBackgroundRoundGradientColor(view, directionType) {
  let colorArr = util.java.array("int", 5);
  colorArr[0] = rndColor();
  colorArr[1] = rndColor();
  colorArr[2] = rndColor();
  colorArr[3] = rndColor();
  colorArr[4] = rndColor();
  gradientDrawable = new GradientDrawable();
  gradientDrawable.setShape(GradientDrawable.RECTANGLE);
  gradientDrawable.setColors(colorArr); //添加颜色组
  gradientDrawable.setGradientType(GradientDrawable.LINEAR_GRADIENT); //设置线性渐变
  switch (directionType) {
    case "leftRight":
      gradientDrawable.setOrientation(GradientDrawable.Orientation.LEFT_RIGHT); //设置渐变方向
      break;
    case "upDown":
      gradientDrawable.setOrientation(GradientDrawable.Orientation.TOP_BOTTOM); //设置渐变方向
      break;
    case "topLeftToBottomRight":
      gradientDrawable.setOrientation(GradientDrawable.Orientation.TL_BR); //设置渐变方向
      break;
    case "RADIAL_GRADIENT":
      gradientDrawable.setGradientType(GradientDrawable.RADIAL_GRADIENT); //设置半径渐变
      gradientDrawable.setGradientRadius(330); //渐变的半径值
      break;
  }
  gradientDrawable.setSize(100, 100);
  view.setBackground(gradientDrawable);
}
function setBackgroundRoundRounded(view) {
  gradientDrawable = new GradientDrawable();
  gradientDrawable.setShape(GradientDrawable.RECTANGLE);
  gradientDrawable.setColor(Color.BLUE);
  gradientDrawable.setCornerRadius(30);
  gradientDrawable.setSize(50, 50);
  view.setBackground(gradientDrawable);
}

function setBackgroundPureColour(view) {
  gradientDrawable = new GradientDrawable();
  gradientDrawable.setShape(GradientDrawable.RECTANGLE);
  gradientDrawable.setColor(Color.BLUE);
  gradientDrawable.setCornerRadius(10);
  gradientDrawable.setSize(50, 50);
  view.setBackground(gradientDrawable);
}
function setBackgroundRoundedRectangleWithBorder(view) {
  gradientDrawable = new GradientDrawable();
  gradientDrawable.setShape(GradientDrawable.RECTANGLE);
  gradientDrawable.setColor(Color.RED);
  gradientDrawable.setStroke(10, Color.BLUE);
  gradientDrawable.setCornerRadius(10);
  gradientDrawable.setSize(50, 50);
  view.setBackground(gradientDrawable);
}
function setBackgroundRoundedRectangle(view) {
  gradientDrawable = new GradientDrawable();
  gradientDrawable.setShape(GradientDrawable.RECTANGLE);
  gradientDrawable.setStroke(10, Color.BLUE);
  gradientDrawable.setCornerRadius(10);
  gradientDrawable.setSize(50, 50);
  view.setBackground(gradientDrawable);
}
function setTextPaintShaderMultipleColors(textView) {
  let style = new SpannableStringBuilder("牙叔牙叔牙叔");
  style.setSpan(new ForegroundColorSpan(rndColor()), 0, 2, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
  style.setSpan(new ForegroundColorSpan(rndColor()), 2, 4, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
  style.setSpan(new ForegroundColorSpan(rndColor()), 4, 6, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
  textView.setText(style);
}
function setTextPaintShaderGradientColor(textView) {
  let colorArr = util.java.array("int", 5);
  colorArr[0] = rndColor();
  colorArr[1] = rndColor();
  colorArr[2] = rndColor();
  colorArr[3] = rndColor();
  colorArr[4] = rndColor();
  mShader = new LinearGradient(0, 0, 100, 100, colorArr, null, Shader.TileMode.REPEAT);
  textView.getPaint().setShader(mShader);
  textView.invalidate();
}
function setTextPaintShaderImg(textView) {
  let mBmp = BitmapFactory.decodeFile(files.path("./res/autojs.png"));
  let mShader = new BitmapShader(mBmp, Shader.TileMode.CLAMP, Shader.TileMode.CLAMP);
  textView.getPaint().setShader(mShader);
  textView.invalidate();
}

function rndColor() {
  return colors.rgb(random(0, 255), random(0, 255), random(0, 255));
}

function rndNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}