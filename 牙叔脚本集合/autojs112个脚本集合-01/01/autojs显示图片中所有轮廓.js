let imgPath = "/sdcard/脚本/autojs提取红框区域//appList.jpg";

/*
 * @version: 1.0
 * @Date: 2021-07-08 18:30:29
 * @LastEditTime: 2021-09-27 17:47:30
 * @LastEditors: 牙叔
 * @Description: 画图像轮廓
 * @FilePath: \autojs-test\autojs显示图片中所有轮廓.js
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

Imgproc.drawContours(src1, contours, -1, Scalar(0, 255, 0, 255), 3, 8);

// cv::Scalar(v1, v2, v3, v4), 前面的三个参数是依次设置BGR的，和RGB相反，第四个参数设置图片的透明度
// Imgproc.drawContours(src1, contours, i, Scalar(0, 255, 0, 255), 3, 8);

viewMat(src1);

src1.release();
img.recycle();
// ===================自定义函数=====================
function viewMat(mat) {
  let tempFilePath = files.join(files.getSdcardPath(), "脚本", "mat.png");
  Imgcodecs.imwrite(tempFilePath, mat);
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
  // Imgproc.findContours(binary, contours, hierarchy, Imgproc.RETR_EXTERNAL, Imgproc.CHAIN_APPROX_SIMPLE, Point());
  Imgproc.findContours(binary, contours, hierarchy, Imgproc.RETR_LIST, Imgproc.CHAIN_APPROX_SIMPLE, Point());

  dst.release();
  gray.release();
  binary.release();
  hierarchy.release();
}