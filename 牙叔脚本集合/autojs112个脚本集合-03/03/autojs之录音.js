"ui";
const voiceFilepath = "/sdcard/1.mp3";
files.createWithDirs(voiceFilepath);
const soundFile = new java.io.File(voiceFilepath);
let recorder = null;
ui.layout(
  <vertical gravity="center">
    <text textSize="66sp" w="*" gravity="center" textStyle="bold">
      录音
    </text>
    <button id="btn" margin="20" textSize="35sp" w="300dp" h="300dp"></button>
    <horizontal weightSum="2" bg="#888888">
      <button id="play" layout_width="0dp" layout_weight="1" textSize="25sp">
        开始播放
      </button>
      <button id="stop" layout_width="0dp" layout_weight="1" textSize="25sp">
        停止播放
      </button>
    </horizontal>
  </vertical>
);
ui.btn.setText("按住录音\n松开识别");
ui.play.click(function () {
  media.playMusic(soundFile.getAbsolutePath());
});
ui.stop.click(function () {
  media.stopMusic();
});

let view = ui.btn;
let r = checkPermission();
if (!r) {
  toastLog("请授予录音权限");
  ui.emitter.on("request_permission_result", function () {
    log(arguments);
  });
  let permissionName = "RECORD_AUDIO";
  requestPermission(permissionName);
} else {
  log("有录音权限");
  view.setOnTouchListener(function (view, event) {
    switch (event.getAction()) {
      case event.ACTION_DOWN:
        log("ACTION_DOWN");
        record();
        return true;
      case event.ACTION_UP:
        log("ACTION_UP");
        recognizeVoice();
        return true;
    }
    return true;
  });
}

events.on("exit", function () {
  if (recorder) {
    recorder.stop();
    recorder.release();
    recorder = null;
    media.stopMusic();
  }
});

// ===============自定义函数====================================================

function record() {
  ui.post(function () {
    view.setText("按钮被按下  按钮被按下  按钮被按下  ");
  });

  recorder = new MediaRecorder();
  recorder.reset();
  recorder.setAudioSource(MediaRecorder.AudioSource.MIC); //声音来源是话筒
  recorder.setOutputFormat(MediaRecorder.OutputFormat.AMR_NB); //设置格式
  recorder.setAudioEncoder(MediaRecorder.AudioEncoder.AMR_NB); //设置解码方式
  recorder.setOutputFile(soundFile.getAbsolutePath());
  //采样频率和bit频率有待提高（前提不会导致bug）
  recorder.setAudioSamplingRate(8);
  recorder.setAudioChannels(1);
  recorder.setAudioEncodingBitRate(1024);
  recorder.prepare();
  recorder.start();
}

function recognizeVoice() {
  log("释放资源开始");
  recorder.stop();
  recorder.release();
  recorder = null;
  log("释放资源结束");
  log('语音识别功能待添加')
}

function requestPermission(permissionName) {
  ActivityCompat.requestPermissions(activity, ["android.permission." + permissionName], 321);
}
function checkPermission() {
  let permissionName = "RECORD_AUDIO";
  let pm = context
    .getPackageManager()
    .checkPermission("android.permission." + permissionName, context.getPackageName());
  if (PackageManager.PERMISSION_GRANTED == pm) {
    return true;
  } else {
    return false;
  }
}