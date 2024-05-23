let imgPath = "/sdcard/脚本/autojs提取红框区域//appList.jpg";

/*
 * @version: 1.0
 * @Date: 2021-07-08 18:30:29
 * @LastEditTime: 2021-09-27 17:47:51
 * @LastEditors: 牙叔
 * @Description: 画图像轮廓
 * @FilePath: \autojs-test\autojs提取图片中最大的轮廓.js
 * @名人名言: 牙叔教程 简单易懂
 * @bilibili: 牙叔教程
 * @公众号: 牙叔教程
 * @QQ群: 747748653
 */
console.time("导入类");
runtime.images.initOpenCvIfNeeded();
importClass(org.opencv.core.MatOfByte);
importClass(org.opencv.core.Scalar);
importClass(org.opencv.core.Point);
importClass(org.opencv.core.CvType);
importClass(java.util.List);
importClass(java.util.ArrayList);
importClass(java.util.LinkedList);
importClass(org.opencv.imgproc.Imgproc);
importClass(org.opencv.imgcodecs.Imgcodecs);
importClass(org.opencv.core.Core);
importClass(org.opencv.core.Mat);
importClass(org.opencv.core.MatOfDMatch);
importClass(org.opencv.core.MatOfKeyPoint);
importClass(org.opencv.core.MatOfRect);
importClass(org.opencv.core.Size);
importClass(org.opencv.features2d.DescriptorMatcher);
importClass(org.opencv.features2d.Features2d);
importClass(org.opencv.core.MatOfPoint2f);
console.timeEnd("导入类");

var img = images.read(imgPath);
let imgWidth = img.getWidth();
let imgHeight = img.getHeight();
let src1 = img.getMat(); // 大图
let contours = new java.util.ArrayList();
contour_info(src1, contours);

// 遍历轮廓, 提取数据
let contourDataArr = [];
for (let i = 0; i < contours.size(); ++i) {
  let item = contours.get(i);
  // 最小外接矩形
  let rotateRect = Imgproc.boundingRect(item);
  // 矩形中心
  let center = new Point(rotateRect.x + rotateRect.width / 2, rotateRect.y + rotateRect.height / 2);
  let contourData = {
    center: center,
    left: rotateRect.x,
    top: rotateRect.y,
    width: rotateRect.width,
    height: rotateRect.height,
    area: rotateRect.area(),
  };
  contourDataArr.push(contourData);
}

// 高度小于图片的1/7
// 高度大于图片的1/20
// 宽度大于图片的7/8
let newContourDataArr = [];
contourDataArr.map((contourData) => {
  if (
    contourData.height < imgHeight / 7 &&
    contourData.height > imgHeight / 20 &&
    contourData.width > imgWidth / 7 / 8
  ) {
    newContourDataArr.push(contourData);
  }
});

newContourDataArr.sort(function (a, b) {
  if (a.area > b.area) {
    return -1;
  } else if (a.area === b.area) {
    return 0;
  } else {
    return 1;
  }
});
// // cv::Scalar(v1, v2, v3, v4), 前面的三个参数是依次设置BGR的，和RGB相反，第四个参数设置图片的透明度
// // Imgproc.drawContours(src1, contours, i, Scalar(0, 255, 0, 255), 3, 8);
let contourData = newContourDataArr[0];
log(contourData);
绘制轮廓并显示图片(img, contourData);
src1.release();
img.recycle();
// ===================自定义函数=====================
function 绘制轮廓并显示图片(img, contourData) {
  var canvas = new Canvas(img);
  var paint = new Paint();
  paint.setStyle(Paint.Style.STROKE);
  paint.setStrokeWidth(26);
  paint.setColor(colors.parseColor("#ffff00"));
  canvas.drawRect(
    contourData.left,
    contourData.top,
    contourData.left + contourData.width,
    contourData.top + contourData.height,
    paint
  );

  let tempFilePath = files.join(files.getSdcardPath(), "脚本", "test.png");
  var image = canvas.toImage();
  images.save(image, tempFilePath);
  image.recycle();
  app.viewFile(tempFilePath);
}

function contour_info(image, contours) {
  let dst = new Mat();
  Imgproc.GaussianBlur(image, dst, Size(3, 3), 0);
  let gray = new Mat();
  let binary = new Mat();
  Imgproc.cvtColor(dst, gray, Imgproc.COLOR_BGR2GRAY);
  Imgproc.threshold(gray, binary, 0, 255, Imgproc.THRESH_BINARY | Imgproc.THRESH_OTSU);
  let hierarchy = new Mat();
  Imgproc.findContours(binary, contours, hierarchy, Imgproc.RETR_LIST, Imgproc.CHAIN_APPROX_SIMPLE, Point());

  dst.release();
  gray.release();
  binary.release();
  hierarchy.release();
}