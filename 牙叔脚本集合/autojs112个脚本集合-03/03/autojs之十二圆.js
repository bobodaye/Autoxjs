"ui";
importClass(android.graphics.RectF);
importClass(android.graphics.Paint);
importClass(android.graphics.Bitmap);
ui.layout(
  <vertical>
    <canvas id="board" w="*" h="*"></canvas>
  </vertical>
);

setTimeout(draw, 100);
let 启用随机颜色 = false;
mPaint = new Paint();
mPaint.setStrokeWidth(10);
var color = "#00ff00";
color = colors.parseColor(color);
mPaint.setColor(color);
mPaint.setStrokeWidth(10); // 设置圆环的宽度
mPaint.setAntiAlias(true); // 消除锯齿
mPaint.setStyle(Paint.Style.STROKE); // 设置空心
let radius = 200;
let mProgress = 0;
let isDrawCircle = true;
let mSpeed = 2;
var bitmap;

let board = ui.board;
function draw() {
  let viewWidth = board.getWidth();
  let viewHeight = board.getHeight();
  bitmap = Bitmap.createBitmap(viewWidth, viewHeight, Bitmap.Config.ARGB_8888);
  var mCanvas = new Canvas(bitmap);
  ui.board.on("draw", function (canvas) {
    canvas.drawBitmap(bitmap, 0, 0, mPaint);
  });

  threads.start(function () {
    画十二个圆形(mCanvas);
  });
}

function 画十二个圆形(canvas) {
  let center = board.getWidth() / 2;
  canvas.drawARGB(255, 123, 104, 238);
  写字(canvas);

  for (var i = 0; i < 12; i++) {
    let oval = new RectF(center - radius, center - radius, center + radius, center + radius); // 用于定义的圆弧的形状和大小的界限
    while (1) {
      if (mProgress > 360) {
        mProgress = 0;
        let color = getRandomColor();
        if (启用随机颜色) {
          mPaint.setColor(color);
        }
        break;
      } else {
        canvas.drawArc(oval, 90, mProgress, false, mPaint); // 根据进度画圆弧
        sleep(mSpeed); //通过传递过来的速度参数来决定线程休眠的时间从而达到绘制速度的快慢
      }
      mProgress += 1;
    }
    canvas.rotate(30, center, center + radius);
  }
}

function 写字(canvas) {
  let viewWidth = board.getWidth();
  let viewHeight = board.getHeight();
  let textPaint = new Paint();
  textPaint.setTextAlign(Paint.Align.CENTER);
  textPaint.setTextSize(280);
  textPaint.setStyle(Paint.Style.FILL);
  textPaint.setColor(colors.parseColor("#f000ff"));
  let fontMetrics = textPaint.getFontMetrics();
  canvas.drawText("牙叔", parseInt(viewWidth / 2), parseInt(viewHeight - 30) - Math.abs(fontMetrics.top), textPaint);
}

function getRandomColor() {
  return (currColor = parseInt(-(Math.random() * (16777216 - 1) + 1)));
}