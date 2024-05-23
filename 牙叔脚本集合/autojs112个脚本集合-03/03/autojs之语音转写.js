importPackage(Packages["okhttp3"]);

importClass(java.io.UnsupportedEncodingException);
importClass(java.security.InvalidKeyException);
importClass(java.security.MessageDigest);
importClass(java.security.NoSuchAlgorithmException);
importClass(java.security.SignatureException);
importClass(javax.crypto.Mac);
importClass(javax.crypto.spec.SecretKeySpec);

const APPID = "XXX";
const SECRET_KEY = "XXX";
let filepath = "/sdcard/1.mp3";
let lfasr_host = "http://raasr.xfyun.cn/api";
// # 请求的接口名
let api_prepare = "/prepare";
let api_upload = "/upload";
let api_merge = "/merge";
let api_get_progress = "/getProgress";
let api_get_result = "/getResult";
let generator = new SliceIdGenerator();

const taskId = prepare();
upload();
merge();
for (var i = 0; i < 10; i++) {
  let r = getProgress();
  if (r) {
    break;
  } else {
    log("服务器正常按照排队识别语音, 请稍后");
  }
  sleep(5000);
}
let result = getResult();
log(result);

// =====================自定义函数=============================================
function HmacSHA1Encrypt(encryptText, encryptKey) {
  let rawHmac;
  encryptText = java.lang.String(encryptText);
  encryptKey = java.lang.String(encryptKey);
  let data = encryptKey.getBytes("UTF-8");
  let secretKey = new SecretKeySpec(data, "HmacSHA1");
  let mac = Mac.getInstance("HmacSHA1");
  mac.init(secretKey);
  let text = encryptText.getBytes("UTF-8");
  rawHmac = mac.doFinal(text);
  let oauth = android.util.Base64.encodeToString(rawHmac, 2);
  return oauth;
}

function getTime() {
  var tmp = Date.parse(new Date()).toString();
  tmp = tmp.substr(0, 10);
  return tmp;
}

function base64Encode(r) {
  r = android.util.Base64.encodeToString(r, 0);
  return r;
}

function getSigna(ts) {
  let md5后的值 = $crypto.digest(APPID + ts, "MD5");
  let sha1Result = HmacSHA1Encrypt(md5后的值, SECRET_KEY);
  return sha1Result;
}

function getFileData(filepath) {
  let file = new java.io.File(filepath);
  if (file.exists() && file.isFile()) {
    let fileName = file.getName();
    log("文件: " + fileName + " 的大小是：" + file.length());
    return {
      name: fileName,
      size: file.length(),
    };
  } else {
    log(filepath);
    throw new Error("文件不存在");
  }
}

function prepare() {
  let fileData = getFileData(filepath);
  let ts = getTime();
  let body = {
    app_id: APPID,
    signa: getSigna(ts),
    ts: ts,
    file_len: fileData.size,
    file_name: fileData.name,
    slice_num: 1,
  };
  log(body);
  let url = "https://raasr.xfyun.cn/api/prepare";
  let headers = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  };
  let r = http.post(url, body, {
    headers: headers,
  });
  let result = r.body.string();
  log(result);
  let obj = JSON.parse(result);
  return obj.data;
}

function SliceIdGenerator() {
  this.INIT_STR = java.lang.String("aaaaaaaaa`");
  this.length = this.INIT_STR.length();
  this.ch = this.INIT_STR.toCharArray();
  this.getNextSliceId = function () {
    let i = 0;
    for (let j = this.length - 1; i < this.length && j >= 0; ++i) {
      if (this.ch[j] != "z") {
        ++this.ch[j];
        break;
      }
      this.ch[j] = "a";
      --j;
    }
    return new java.lang.String(this.ch);
  };
}

function upload() {
  let fileByteContent = files.readBytes(filepath);
  let ts = getTime();
  let slice_id = generator.getNextSliceId();
  let signa = getSigna(ts);

  let client = new OkHttpClient();
  let requestBody = new MultipartBody.Builder().setType(MultipartBody.FORM);
  let file = fileByteContent;
  let body = RequestBody.create(MediaType.parse("audio/wav"), file);
  requestBody.addFormDataPart("content", files.getName(filepath), body);
  requestBody.addFormDataPart("app_id", APPID);
  requestBody.addFormDataPart("signa", signa);
  requestBody.addFormDataPart("ts", ts);
  requestBody.addFormDataPart("task_id", taskId);
  requestBody.addFormDataPart("slice_id", slice_id);
  let url = "https://raasr.xfyun.cn/api/upload";
  let request = new Request.Builder().url(url).post(requestBody.build()).build();
  let response = client.newCall(request).execute();

  if (response != null && response.body() != null) {
    let resultString = response.body().string();
    let result = JSON.parse(resultString);
    log(result);
    return result;
  }
}

// 合并文件
function merge() {
  log(arguments.callee.name);
  let ts = getTime();
  let body = {
    app_id: APPID,
    signa: getSigna(ts),
    ts: ts,
    task_id: taskId,
  };
  log(body);
  let url = "https://raasr.xfyun.cn/api/merge";
  let headers = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  };
  let r = http.post(url, body, {
    headers: headers,
  });
  let result = r.body.string();
  log(result);
  let obj = JSON.parse(result);
  return obj.data;
}
// 查询处理进度
function getProgress() {
  log(arguments.callee.name);
  let ts = getTime();
  let body = {
    app_id: APPID,
    signa: getSigna(ts),
    ts: ts,
    task_id: taskId,
  };
  log(body);
  let url = "https://raasr.xfyun.cn/api/getProgress";
  let headers = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  };
  let r = http.post(url, body, {
    headers: headers,
  });
  let result = r.body.string();
  log(result);
  let obj = JSON.parse(result);
  let data = obj.data;
  data = JSON.parse(data);
  let status = data.status;
  if (status === 9) {
    return true;
  } else {
    log("status = ");
    log(status);
  }
}
// 获取结果
function getResult() {
  log(arguments.callee.name);
  let ts = getTime();
  let body = {
    app_id: APPID,
    signa: getSigna(ts),
    ts: ts,
    task_id: taskId,
  };
  let url = "https://raasr.xfyun.cn/api/getResult";
  let headers = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  };
  let r = http.post(url, body, {
    headers: headers,
  });
  let result = r.body.string();
  log(result);
  let obj = JSON.parse(result);
  let data = obj.data;
  log(data);
  data = JSON.parse(data);
  let arr = [];
  var len = data.length;
  for (var i = 0; i < len; i++) {
    arr.push(data[i].onebest);
  }
  result = arr.join("\n");
  return result;
}