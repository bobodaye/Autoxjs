//auto();

let appPackageNameList = [];

const itemInfo = {
    151: { name: "自由券.10分钟", app: null },
    782: { name: "抖音", app: 'com.ss.android.ugc.aweme' },
    781: { name: "微博", app: 'com.sina.weibo' },
    773: { name: "小红书", app: 'com.xingin.xhs' },
    772: { name: "b站", app: 'tv.danmaku.bili' },
    771: { name: "知乎", app: 'com.zhihu.android' },
    788: { name: "腾讯视频", app: 'com.tencent.qqlive' },
};

let currentItemId = 0;     // 当前使用的商品ID
let currentApp = null;     // 当前正在运行的APP
let timerId = null;        // 倒计时定时器ID
let switchAppTime = 0;     // 切换APP后运行时长（单位：秒）
let keepAppTime = 0;       // 保持APP的允许时长（单位：秒）
let receiveCutDownEvt = false;  //是否接收到倒计时事件

const queryCoinString = "app.lifeup.query.coin";
const queryItemString = "app.lifeup.query.item";
//const useItemString = "app.lifeup.item.use";
const useItemStatusString = "app.lifeup.item.use.status";
const countDownStartString = "app.lifeup.item.countdown.start";
const countDownStopString = "app.lifeup.item.countdown.stop";
const countDownCompleteString = "app.lifeup.item.countdown.complete";

function exitAppMethod() {
    let op = 1;

    if (op === 0) {
        home();
    } else if (op === 1) {
        callApi("anywhere://open?sid=7008");
    }
}

// 0 - 普通样式
// 1 - 奖励样式
// 2 - 番茄样式
// 3 - 成功样式
// 4 - 提示样式
// 5 - 警告样式
// 6 - 错误样式
const toastType = {
    NORMAL_TYPE: 0,
    REWARD_TYPE: 1,
    POMODORO_TYPE: 2,
    SUCCESS_TYPE: 3,
    INFO_TYPE: 4,
    WARNING_TYPE: 5,
    ERROR_TYPE: 6,
};

function toastMethod(str, type) {
    let op = 1;

    if (op === 0) {
        toast(str);
    } else if (op === 1) {

        callApi("lifeup://api/toast?text=" + encodeURIComponent(str) + "&type=" + type + "&isLong=true");
    }
}

// 定义广播接收器
var receiver = new android.content.BroadcastReceiver({
    onReceive: function(context, intent) {
        console.log("Broadcast received.");
        var action = intent.getAction();
        var extras = intent.getExtras();
        if (extras) {
            var data = {};
            var keys = extras.keySet();
            for (var key of keys) {
                data[key] = extras.get(key);
            }
            console.log("All received data: " + JSON.stringify(data));

            if (queryCoinString === action) {
                handleQueryCoin(data);
            } else if (queryItemString === action) {
                handleQueryItem(data);
            } else if (useItemStatusString === action) {
                handleUseItemStatus(data);
            } else if (countDownStartString === action) {
                handleCountDownStart(data);
            } else if (countDownStopString === action) {
                handleCountDownStop(data);
            } else if (countDownCompleteString === action) {
                handleCountDownComplete(data);
            }
        } else {
            console.log("No extras found in the intent.");
        }
    }
});

// 注册广播接收器
var filter = new android.content.IntentFilter();
filter.addAction(queryCoinString);
filter.addAction(queryItemString);
//filter.addAction(useItemString);
filter.addAction(useItemStatusString);
filter.addAction(countDownStartString);
filter.addAction(countDownStopString);
filter.addAction(countDownCompleteString);
context.registerReceiver(receiver, filter);
console.log("BroadcastReceiver registered.");

// 定义一个函数来调用API
function callApi(str) {
    let intent = app.intent({
        action: "VIEW",
        data: str,
        flags: ["activity_new_task"]
    });

    console.log("Starting activity with intent: " + intent.toUri(0));
    context.startActivity(intent);
}

// 处理查询金币结果
function handleQueryCoin(data) {
    let coinValue = data.value;
    console.log(`handleQueryCoin: coinValue = ${coinValue}`);
    if (coinValue > 0) {
        callApi("lifeup://api/query?key=item&item_id=" + currentItemId + "&broadcast=" + queryItemString);
    } else {
        toastMethod("金币不够啦，继续赚取金币吧！", toastType.WARNING_TYPE);
        console.log("金币不足，无法使用商品");
        setTimeout(() => { exitAppMethod(); resetState(); }, 500);
    }
}

// 处理查询商品结果
function handleQueryItem(data) {
    let ownNumber = data.own_number;
    console.log(`handleQueryItem: ownNumber = ${ownNumber}`);
    if (ownNumber > 0) {
        confirmUseItem();
    } else {
        if (currentItemId !== 151) {
            currentItemId = 151; // 尝试使用自由券
            console.log("尝试使用自由券");
            callApi("lifeup://api/query?key=item&item_id=" + currentItemId + "&broadcast=" + queryItemString);
        } else {
            toastMethod("商品存货不足啦，继续完成任务吧！", toastType.WARNING_TYPE);
            console.log("商品数量不足，无法使用商品");
            setTimeout(() => { exitAppMethod(); resetState(); }, 500);
        }
    }
}
function confirmUseItem() {
    let countDown = 5000;

    let view = ui.inflate(
        <vertical padding="16dp" background="#FFFFFF">
            <text textSize="22sp" textColor="#000000" gravity="left" textStyle="bold" text="确认使用商品"/>
            <text id="prompt" textSize="16sp" textColor="#666666" gravity="left" marginTop="20dp" text=""/>
            
            <vertical layout_height="40dp" />
        
            <horizontal gravity="right" marginTop="16dp">
            <button id="cancel" text="取消(5)" style="Widget.AppCompat.Button.Borderless.Colored" textSize="15sp" padding="8dp"/>
            <button id="confirm" text="确认" style="Widget.AppCompat.Button.Borderless.Colored" textSize="15sp" padding="8dp"/>
            </horizontal>
        </vertical>,
        null,
        false
    );
        
    view.confirm.click(function () {
        countDownTimer.cancel();
        dialog.dismiss();
        callApi("lifeup://api/use_item?id=" + currentItemId + "&use_times=1&broadcast=" + useItemStatusString);
    });

    view.cancel.click(function () {
        countDownTimer.cancel();
        dialog.dismiss();
        toastMethod("继续好好完成任务吧！", toastType.INFO_TYPE);
        console.log("取消使用商品");
        setTimeout(() => { exitAppMethod(); resetState(); }, 500);
    });

    let dialog = dialogs.build({
        customView: view,
        wrapInScrollView: false,
    });

    ui.run(() => { view.prompt.setText("确定使用商品" + itemInfo[currentItemId].name + "吗？") })
    
    dialog.setCanceledOnTouchOutside(false);

    let countDownTimer = JavaAdapter(android.os.CountDownTimer, {
        onTick: function (millisUntilFinished) {
            ui.run(function () {
                view.cancel.setText("取消(" + Math.ceil(millisUntilFinished / 1000) + ")");
            });
        },
        onFinish: function () {
            if (dialog.isShowing()) {
                dialog.dismiss();
                toastMethod("继续好好完成任务吧！", toastType.INFO_TYPE);
                console.log("取消使用商品");
                setTimeout(() => { exitAppMethod(); resetState(); }, 500);
            }
        },
    },
    countDown,
    1000
    );
    
    dialog.setOnShowListener(
        new android.content.DialogInterface.OnShowListener({
            onShow: function (dialog) {
            countDownTimer.start();
            },
        })
    );
    
    dialog.show();
}

// 处理使用商品结果
function handleUseItemStatus(data) {
    let result = data.result;
    console.log(`handleUseItemStatus: result = ${result}`);
    if (parseInt(result) === 0) {
        toastMethod("适度休息才能更好地迎接困难和挑战，加油！", toastType.SUCCESS_TYPE);
        console.log("商品使用成功");
    } else {
        let errorMsg = ["使用成功", "数据库异常", "经验值不足限制", "找不到商品", "运行倒计时冲突", "库存不足"][result];
        toastMethod("商品使用失败：" + errorMsg, toastType.ERROR_TYPE);
        console.log(`商品使用失败：${errorMsg}`);
        setTimeout(() => { exitAppMethod(); resetState(); }, 500);
    }
}

// 处理倒计时开始
function handleCountDownStart(data) {
    console.log("倒计时开始: " + JSON.stringify(data));
    currentItemId = parseInt(data.item_id);
    receiveCutDownEvt = true;
}

// 处理倒计时停止
function handleCountDownStop(data) {
    console.log("倒计时停止: " + JSON.stringify(data));
    resetState();
}

// 处理倒计时完成
function handleCountDownComplete(data) {
    console.log("倒计时完成: " + JSON.stringify(data));
    resetState();
}

// 开始监听APP运行
function startMonitoringApps() {
    if (timerId) {
        console.log("监听APP运行定时器已创建");
        return;
    }

    console.log("开始监听APP运行");

    timerId = setInterval(() => {
        appPackageNameList.forEach(packageName => {
            if (isAppOpen(packageName)) {
                handleAppOpen(packageName);
            }
        });
    }, 1000); // 每秒检查一次
}

// 停止监听APP运行
function stopMonitoringApps() {
    if (timerId) {
        console.log("停止监听APP运行");
        clearInterval(timerId);
        timerId = null;
    } 
}

// 处理APP打开
function handleAppOpen(packageName) {
    if (currentApp !== packageName) {
        keepAppTime = 0;
        switchAppTime++;
        console.log(`handleAppOpen: packageName = ${packageName}`);
        
        if (switchAppTime >= 10) {
            currentApp = packageName;

            if (currentItemId === 0) {
                handleAppOpenWithoutItem(packageName);
            } else if (currentItemId !== 151 && packageName !== itemInfo[currentItemId].app) {
                toastMethod("商品指定APP了，快切换APP吧", toastType.WARNING_TYPE);
                console.log("未授权的应用，返回桌面");
                setTimeout(() => { exitAppMethod(); currentApp = null; }, 500);
            }
        }
    } else {
        switchAppTime = 0;

        keepAppTime++;
        if (keepAppTime >= 10) {
            if (receiveCutDownEvt === false) {
                console.log("APP运行超过10s，仍未接收到倒计时事件");
                resetState();
            }
        }
    }
}

// 在没有使用商品的情况下处理APP打开
function handleAppOpenWithoutItem(packageName) {
    console.log(`handleAppOpenWithoutItem: packageName = ${packageName}`);
    for (let itemId in itemInfo) {
        if (itemInfo[itemId].app === packageName) {
            currentItemId = parseInt(itemId);
            console.log(`尝试使用指定应用券: itemId = ${currentItemId}`);
            callApi("lifeup://api/query?key=coin&broadcast=" + queryCoinString);
            return;
        }
    }
    // 如果没有找到对应的APP，则使用自由券
    currentItemId = 151;
    console.log("使用自由券");
    callApi("lifeup://api/query?key=coin&broadcast=" + queryCoinString);
}

// 检查应用是否在运行
function isAppOpen(packageName) {
    let isOpen = currentPackage() === packageName;
    if (isOpen && currentApp !== packageName) {
        console.log(`isAppOpen: packageName = ${packageName}, isOpen = ${isOpen}`);
    }
    return isOpen;
}

// 添加应用到监听列表
function addAppToList(packageName) {
    if (!appPackageNameList.includes(packageName)) {
        appPackageNameList.push(packageName);
        console.log(`Added ${packageName} to the monitoring list.`);
    } else {
        console.log(`${packageName} is already in the monitoring list.`);
    }
}

// 重置状态
function resetState() {
    console.log("重置状态");
    currentItemId = 0;
    currentApp = null;
    receiveCutDownEvt = false;
}

// 初始化
function init() {
    addAppToList('tv.danmaku.bili');   // b站
    addAppToList('com.xingin.xhs');    // 小红书
    addAppToList('com.sina.weibo');    // 微博
    addAppToList('com.zhihu.android'); // 知乎
    addAppToList('com.ss.android.ugc.aweme');    // 抖音
    addAppToList('com.tencent.qqlive')  //腾讯视频

    startMonitoringApps();
}

// 在程序退出时取消注册广播接收器
events.on("exit", function() {
    context.unregisterReceiver(receiver);
    console.log("BroadcastReceiver unregistered.");

    stopMonitoringApps();
});

//通过anywhere授权无障碍权限
callApi("anywhere://open?sid=7280");

// 初始化
init();

// 保持脚本运行
setInterval(() => {}, 1000);
