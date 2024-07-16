let appPackageNameList = [];
let itemTimeLeftInfoList = [];

/* 
说明：人升APP中必须创建自由券和休息券
*/
const itemInfo = [
    { 人升商品ID: 151, 商品名称: "自由券" },
    { 人升商品ID: 811, 商品名称: "休息券" },
    { 人升商品ID: 782, APP名称: "抖音" },
    { 人升商品ID: 781, APP名称: "微博" },
    { 人升商品ID: 773, APP名称: "小红书" },
    { 人升商品ID: 772, APP名称: "哔哩哔哩" },
    { 人升商品ID: 771, APP名称: "知乎" },
    { 人升商品ID: 788, APP名称: "腾讯视频" },
];

let currentItemId = 0;     // 当前使用的商品ID
let currentApp = null;     // 当前正在运行的APP
let timerId = null;        // 监听APP运行定时器ID
let switchAppTime = 0;     // 切换APP后运行时长（单位：秒）
let keepAppTime = 0;       // 保持APP的运行时长（单位：秒）
let receiveCutDownEvt = false;  //是否接收到倒计时事件
let FREE_COUPON_ID = 0;     //自由券ID
let REST_COUPON_ID = 0;     //休息券ID
let lifeUpStorage = null;

const queryCoinString = "app.lifeup.query.coin";
const queryItemString = "app.lifeup.query.item";
//const useItemString = "app.lifeup.item.use";
const useItemStatusString = "app.lifeup.item.use.status";
const countDownStartString = "app.lifeup.item.countdown.start";
const countDownStopString = "app.lifeup.item.countdown.stop";
const countDownCompleteString = "app.lifeup.item.countdown.complete";

for (let engine of engines.all()) {
    if (engine !== engines.myEngine()) {
        console.log("forceStop " + engine);
        engine.forceStop();
    }
}

function init_storage()
{
    lifeUpStorage = storages.create("lifeUpStorage");

    itemTimeLeftInfoList = lifeUpStorage.get("itemTimeLeftInfo", []);
    if (itemTimeLeftInfoList.length > 0) {
        itemTimeLeftInfoList = itemTimeLeftInfoList.filter(itemTimeLeftInfo => {
            let existsInItemInfo = false;
    
            for (let j = 0; j < itemInfo.length; j++) {
                if (itemTimeLeftInfo.id === itemInfo[j].id) {
                    existsInItemInfo = true;
                    break;
                }
            }
    
            if (!existsInItemInfo) {
                console.log(`倒计时 ${itemTimeLeftInfo.name}不存在，id=${itemTimeLeftInfo.id}，从数据集中删除`);
            }
    
            return existsInItemInfo;
        });

        console.log(`更新倒计时信息:${JSON.stringify(itemTimeLeftInfoList)}`);

        lifeUpStorage.put("itemTimeLeftInfo", itemTimeLeftInfoList);
    }
}

/**
 * 根据ID查找数组中的对象
 * @param {Array} arr - 包含对象的数组
 * @param {number|string} id - 要查找的对象ID
 * @returns {Object|null} - 查找到的对象或null（如果未找到）
 */
function findObjectById(arr, id)
{
    return arr.find(obj => obj.id === id) || null;
}

function init_iteminfo()
{
    for (let item of itemInfo) {
        if (item.商品名称 === "自由券") {
            FREE_COUPON_ID = parseInt(item.人升商品ID);
            item.app = null;
            item.name = item.商品名称;
        } else if (item.商品名称 === "休息券") {
            REST_COUPON_ID = parseInt(item.人升商品ID);
            item.app = null;
            item.name = item.商品名称;
        } else if (item.APP名称 !== undefined) {
            item.app = getPackageName(item.APP名称);
            if (null === item.app) {
                toastLog(`APP '${item.APP名称}' 不存在，请检查`)
            }
            item.name = item.APP名称;
        }

        item.id = parseInt(item.人升商品ID);
    }

    console.log("自由券ID = " + FREE_COUPON_ID);
    console.log("休息券ID = " + REST_COUPON_ID);
    console.log(JSON.stringify(itemInfo));

    init_storage();
}

function updateItemTimeLeft(itemID, itemName, itemTimeLeft)
{
    let _itemID = parseInt(itemID);
    let _itemName = String(itemName);
    let _itemTimeLeft = parseInt(itemTimeLeft);

    for (let item of itemTimeLeftInfoList) {
        if (_itemID === item.id) {
            console.log(`更新${_itemName}剩余时间为${_itemTimeLeft}`);
            item.name = _itemName;
            item.time_left = _itemTimeLeft;

            lifeUpStorage.put("itemTimeLeftInfo", itemTimeLeftInfoList);
            return;
        }
    }

    console.log(`添加${_itemName}剩余时间为${_itemTimeLeft}秒`);
    itemTimeLeftInfoList.push({id: _itemID, name: _itemName, time_left: _itemTimeLeft});
    lifeUpStorage.put("itemTimeLeftInfo", itemTimeLeftInfoList);
}

const rish_dir = "/data/data/org.autojs.autoxjs.v6/files/";
const open_autojs_accessibility = "settings put secure enabled_accessibility_services org.autojs.autoxjs.v6/com.stardust.autojs.core.accessibility.AccessibilityService";
const foreground_app = "dumpsys activity activities | grep \"windows=\\[W\" | sed -n '1p'";
let rish_sh = new Shell();
let detect_rish_sh = new Shell();

function init_rish_shell()
{
    const rish_base64 = "IyEvc3lzdGVtL2Jpbi9zaApCQVNFRElSPSQoZGlybmFtZSAiJDAiKQpERVg9IiRCQVNFRElSIi9yaXNoX3NoaXp1a3UuZGV4CgppZiBbICEgLWYgIiRERVgiIF07IHRoZW4KICBlY2hvICJDYW5ub3QgZmluZCAkREVYLCBwbGVhc2UgY2hlY2sgdGhlIHR1dG9yaWFsIGluIFNoaXp1a3UgYXBwIgogIGV4aXQgMQpmaQoKaWYgWyAkKGdldHByb3Agcm8uYnVpbGQudmVyc2lvbi5zZGspIC1nZSAzNCBdOyB0aGVuCiAgaWYgWyAtdyAkREVYIF07IHRoZW4KICAgIGVjaG8gIk9uIEFuZHJvaWQgMTQrLCBhcHBfcHJvY2VzcyBjYW5ub3QgbG9hZCB3cml0YWJsZSBkZXguIgogICAgZWNobyAiQXR0ZW1wdGluZyB0byByZW1vdmUgdGhlIHdyaXRlIHBlcm1pc3Npb24uLi4iCiAgICBjaG1vZCA0MDAgJERFWAogIGZpCiAgaWYgWyAtdyAkREVYIF07IHRoZW4KICAgIGVjaG8gIkNhbm5vdCByZW1vdmUgdGhlIHdyaXRlIHBlcm1pc3Npb24gb2YgJERFWC4iCiAgICBlY2hvICJZb3UgY2FuIGNvcHkgdG8gZmlsZSB0byB0ZXJtaW5hbCBhcHAncyBwcml2YXRlIGRpcmVjdG9yeSAoL2RhdGEvZGF0YS88cGFja2FnZT4sIHNvIHRoYXQgcmVtb3ZlIHdyaXRlIHBlcm1pc3Npb24gaXMgcG9zc2libGUiCiAgICBleGl0IDEKICBmaQpmaQoKIyBSZXBsYWNlICJQS0ciIHdpdGggdGhlIGFwcGxpY2F0aW9uIGlkIG9mIHlvdXIgdGVybWluYWwgYXBwClsgLXogIiRSSVNIX0FQUExJQ0FUSU9OX0lEIiBdICYmIGV4cG9ydCBSSVNIX0FQUExJQ0FUSU9OX0lEPSJvcmcuYXV0b2pzLmF1dG94anMudjYiCi9zeXN0ZW0vYmluL2FwcF9wcm9jZXNzIC1EamF2YS5jbGFzcy5wYXRoPSIkREVYIiAvc3lzdGVtL2JpbiAtLW5pY2UtbmFtZT1yaXNoIHJpa2thLnNoaXp1a3Uuc2hlbGwuU2hpenVrdVNoZWxsTG9hZGVyICIkQCIK";
    const rish_shizuku_base64 = "ZGV4CjAzNQAa/1bOcipPWeWPWgcXCpDLf/u2aEF1pm6sGgAAcAAAAHhWNBIAAAAAAAAAAOgZAACO" + 
    "AAAAcAAAADAAAACoAgAAJQAAAGgDAAALAAAAJAUAAD4AAAB8BQAABAAAAGwHAADAEgAA7AcAAKAO" + 
    "AACoDgAAqw4AAM4OAADYDgAA4A4AAOMOAAAVDwAAJg8AACkPAAA5DwAARw8AAEoPAABNDwAAUQ8A" + 
    "AFUPAABZDwAAXg8AAGUPAABsDwAAkQ8AALYPAADWDwAA+A8AABQQAAA3EAAAURAAAGYQAACCEAAA" + 
    "lhAAAKsQAADBEAAA1xAAAOwQAAABEQAAHhEAAD8RAABUEQAAbhEAAJIRAACyEQAA0hEAAOIRAAD5" + 
    "EQAAExIAACYSAAA/EgAAYxIAAHcSAACNEgAAoRIAALwSAADQEgAA5xIAAAMTAAAYEwAARBMAAG4T" + 
    "AAClEwAAqhMAAL8TAAAuFAAASxQAABkVAAAiFQAAMhUAAEkVAABVFQAAWBUAAFwVAABgFQAAZRUA" + 
    "AGoVAABxFQAAdBUAAHsVAAB/FQAAhBUAAIkVAACdFQAAshUAAMcVAADKFQAA1xUAAOEVAADrFQAA" + 
    "8xUAAAAWAAADFgAACxYAABwWAABkFgAAZxYAAHMWAAB9FgAAhBYAAJcWAACmFgAAqRYAAK8WAAC3" + 
    "FgAAvBYAAMQWAADKFgAA0RYAANkWAADsFgAA+xYAAAcXAAAUFwAAIBcAADYXAAA+FwAARhcAAE4X" + 
    "AABbFwAAZBcAAHcXAACCFwAAiBcAAI4XAACWFwAAtxcAANMXAADZFwAA5RcAAPgXAAD+FwAACxgA" + 
    "AB4YAAAvGAAAOBgAAEMYAABNGAAAWRgAAGsYAACXGAAAnBgAAKgYAAC9GAAAxxgAAM4YAAAFAAAA" + 
    "CAAAAAsAAAARAAAAEgAAABMAAAAUAAAAFQAAABYAAAAXAAAAGAAAABkAAAAaAAAAGwAAABwAAAAd" + 
    "AAAAHgAAAB8AAAAgAAAAIQAAACIAAAAjAAAAJAAAACUAAAAmAAAAJwAAACgAAAApAAAAKgAAACsA" + 
    "AAAsAAAALQAAAC4AAAAvAAAAMAAAADEAAAAyAAAAMwAAADQAAAA1AAAANgAAADcAAAA4AAAAQwAA" + 
    "AEkAAABOAAAATwAAAFAAAAAIAAAAAQAAAAAAAAAJAAAAAQAAALQNAAAKAAAAAQAAANQNAAAPAAAA" + 
    "BwAAAPANAAAOAAAACwAAAPgNAAAQAAAACwAAAAAOAAAPAAAACwAAAAgOAAAQAAAACwAAABAOAAAM" + 
    "AAAAEQAAAAAAAAAPAAAAEQAAAAgOAAAMAAAAEgAAAAAAAAAPAAAAHgAAAAgOAAAMAAAAHwAAAAAA" + 
    "AAAQAAAAIQAAABgOAAAMAAAAIwAAAAAAAAAPAAAAIwAAAAgOAAAQAAAAIwAAACAOAAANAAAAJAAA" + 
    "ACgOAAAPAAAAJAAAAAgOAAAQAAAAJwAAADAOAABDAAAAKwAAAAAAAABEAAAAKwAAAPgNAABHAAAA" + 
    "KwAAADgOAABFAAAAKwAAAEAOAABFAAAAKwAAAEgOAABFAAAAKwAAAAgOAABGAAAAKwAAAFAOAABH" + 
    "AAAAKwAAAFgOAABIAAAAKwAAAGAOAABFAAAAKwAAAGwOAABJAAAALAAAAAAAAABKAAAALAAAAHQO" + 
    "AABLAAAALAAAAIAOAABLAAAALAAAAIgOAABNAAAALAAAAJAOAABLAAAALAAAAKwNAABMAAAALAAA" + 
    "AJgOAAADACMAUQAAAAQAEQBRAAAABAAjAFcAAAANAAEAPwAAAA4ALwBAAAAAGwAAAH0AAAAlABwA" + 
    "ZAAAACoALwBRAAAAKgAjAFcAAAAqABAAWwAAACoAKQBhAAAAAwAZAAQAAAADABQAiAAAAAQAFgAE" + 
    "AAAABAAUAIgAAAAFAAMAVgAAAAYAAwBWAAAABwABAFkAAAAHAAIAigAAAAsAGQAEAAAACwAEAFQA" + 
    "AAALAAUAYAAAAAsABwCEAAAACwAGAIkAAAAMABQABAAAAAwAHwB8AAAADwAUAAQAAAAPABsAgwAA" + 
    "ABAAFwAEAAAAEAAjAH4AAAAQACQAfwAAABIACgBqAAAAEgAUAHYAAAASABQAgAAAABMADgCFAAAA" + 
    "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" + 
    "BQAAAAwAKAVxEAQAAAAMAAgSAAASBRIHEggSCRIKEgsSDBL9Eg4SEBMQAAATEQAACAQSAAEPeA4G" + 
    "AAQAKGoNAAcEYAADABMFGgAyUAgAYAADABMFGwAzUF4AbhA0AAQADAAaBQYAcSA3AFAACgA4AFIA" + 
    "YgAGABoEWgBuICYAQABiAAYAbhAlAAAAIgALAHAgCAAgABUCAARuIAkAIAAMABUCABBuIAkAIAAM" + 
    "ABUCCABuIAkAIAAMAG4wCwAwAQwAGgE9AHEgCgAQAAwTExEAAGIACAATFAAAExUAABMWAAATFwAA" + 
    "ExgAABMZAAATGgAAcQAcAAAACgEUAqCGAQCTGwECCBASAAgSAAB4DAcAEAAOACcETQAAAAMAAQAB" + 
    "AFEBAMJLAAEALC0AAQEAASIO8AAAAAABAAAAIgAAAA0AAAAIAAsAIwAKAAEAIwAPAC8AAQAPACwA" + 
    "LAABAAAACwAAAAgAIwALACMAEQAjAAEAAQAJAA8AAQAAAAEAAAARAAAAAQAAAAEAAAACAAAACwAd" + 
    "AAEAAAAjAAAAAgAAACMADwACAAAAIQAuAAIAAAAjAC4AAQAAAAAAAAACAAAAIwAtAAIAAAARACMA" + 
    "AQAAABIAAAABAAAAHAAAAAIAAAAjAAEAAgAAACMAEQAEAAAAIwAjACMAHwABAAAALwAAAAQAAAAB" + 
    "ABMAEwABAAEAAAAdAAAAAQAAACEAAAACAAAAIQAhAAIAAAAiAAIABiEvbGliLwABLgAhL2RhdGEv" + 
    "bG9jYWwvdG1wL3Jpc2gtc2hpenVrdS0xMDQ5AAg8Y2xpbml0PgAGPGluaXQ+AAFDADBDYWxsaW5n" + 
    "IGFwcGxpY2F0aW9uIGRpZCBub3QgcHJvdmlkZSBwYWNrYWdlIG5hbWUAD0NsYXNzIG5vdCBmb3Vu" + 
    "ZAABSQAOSUxMTExJTExMSUxaWkkADElMTExMTExJSUxMSQABSgABTAACTEMAAkxJAAJMTAADTExM" + 
    "AAVMYS9hOwAFTGEvYjsAI0xhbmRyb2lkL2FwcC9BY3Rpdml0eU1hbmFnZXJOYXRpdmU7ACNMYW5k" + 
    "cm9pZC9hcHAvSUFjdGl2aXR5TWFuYWdlciRTdHViOwAeTGFuZHJvaWQvYXBwL0lBY3Rpdml0eU1h" + 
    "bmFnZXI7ACBMYW5kcm9pZC9hcHAvSUFwcGxpY2F0aW9uVGhyZWFkOwAaTGFuZHJvaWQvYXBwL1By" + 
    "b2ZpbGVySW5mbzsAIUxhbmRyb2lkL2NvbnRlbnQvSUludGVudFJlY2VpdmVyOwAYTGFuZHJvaWQv" + 
    "Y29udGVudC9JbnRlbnQ7ABNMYW5kcm9pZC9vcy9CaW5kZXI7ABpMYW5kcm9pZC9vcy9CdWlsZCRW" + 
    "RVJTSU9OOwASTGFuZHJvaWQvb3MvQnVpbGQ7ABNMYW5kcm9pZC9vcy9CdW5kbGU7ABRMYW5kcm9p" + 
    "ZC9vcy9IYW5kbGVyOwAUTGFuZHJvaWQvb3MvSUJpbmRlcjsAE0xhbmRyb2lkL29zL0xvb3BlcjsA" + 
    "E0xhbmRyb2lkL29zL1BhcmNlbDsAG0xhbmRyb2lkL29zL1NlcnZpY2VNYW5hZ2VyOwAfTGFuZHJv" + 
    "aWQvc3lzdGVtL0Vycm5vRXhjZXB0aW9uOwATTGFuZHJvaWQvc3lzdGVtL09zOwAYTGFuZHJvaWQv" + 
    "dGV4dC9UZXh0VXRpbHM7ACJMZGFsdmlrL2Fubm90YXRpb24vRW5jbG9zaW5nQ2xhc3M7AB5MZGFs" + 
    "dmlrL2Fubm90YXRpb24vSW5uZXJDbGFzczsAHkxkYWx2aWsvc3lzdGVtL0RleENsYXNzTG9hZGVy" + 
    "OwAOTGphdmEvaW8vRmlsZTsAFUxqYXZhL2lvL1ByaW50U3RyZWFtOwAYTGphdmEvbGFuZy9DaGFy" + 
    "U2VxdWVuY2U7ABFMamF2YS9sYW5nL0NsYXNzOwAXTGphdmEvbGFuZy9DbGFzc0xvYWRlcjsAIkxq" + 
    "YXZhL2xhbmcvQ2xhc3NOb3RGb3VuZEV4Y2VwdGlvbjsAEkxqYXZhL2xhbmcvT2JqZWN0OwAUTGph" + 
    "dmEvbGFuZy9SdW5uYWJsZTsAEkxqYXZhL2xhbmcvU3RyaW5nOwAZTGphdmEvbGFuZy9TdHJpbmdC" + 
    "dWlsZGVyOwASTGphdmEvbGFuZy9TeXN0ZW07ABVMamF2YS9sYW5nL1Rocm93YWJsZTsAGkxqYXZh" + 
    "L2xhbmcvcmVmbGVjdC9NZXRob2Q7ABNMamF2YS91dGlsL09iamVjdHM7ACpMcmlra2Evc2hpenVr" + 
    "dS9zaGVsbC9TaGl6dWt1U2hlbGxMb2FkZXIkYTsAKExyaWtrYS9zaGl6dWt1L3NoZWxsL1NoaXp1" + 
    "a3VTaGVsbExvYWRlcjsANU1ha2Ugc3VyZSB5b3UgaGF2ZSBTaGl6dWt1IHYxMi4wLjAgb3IgYWJv" + 
    "dmUgaW5zdGFsbGVkAANQS0cAE1JJU0hfQVBQTElDQVRJT05fSUQAbVJJU0hfQVBQTElDQVRJT05f" + 
    "SUQgaXMgbm90IHNldCwgc2V0IHRoaXMgZW52aXJvbm1lbnQgdmFyaWFibGUgdG8gdGhlIGlkIG9m" + 
    "IGN1cnJlbnQgYXBwbGljYXRpb24gKHBhY2thZ2UgbmFtZSkAG1JlcXVlc3QgYmluZGVyIGZyb20g" + 
    "U2hpenVrdQDLAVJlcXVlc3QgdGltZW91dC4gVGhlIGNvbm5lY3Rpb24gYmV0d2VlbiB0aGUgY3Vy" + 
    "cmVudCBhcHAgKCUxJHMpIGFuZCBTaGl6dWt1IGFwcCBtYXkgYmUgYmxvY2tlZCBieSB5b3VyIHN5" + 
    "c3RlbS4gUGxlYXNlIGRpc2FibGUgYWxsIGJhdHRlcnkgb3B0aW1pemF0aW9uIGZlYXR1cmVzIGZv" + 
    "ciBib3RoIGN1cnJlbnQgYXBwICglMSRzKSBhbmQgU2hpenVrdSBhcHAuAAdTREtfSU5UAA5TVVBQ" + 
    "T1JURURfQUJJUwAVU2VydmVyIGlzIG5vdCBydW5uaW5nAApTb3VyY2VGaWxlAAFWAAJWSQACVkwA" + 
    "A1ZMSQADVkxMAAVWTExMTAABWgAFWklMTEkAAlpMAANaTEoAA1pMTAASW0xqYXZhL2xhbmcvQ2xh" + 
    "c3M7ABNbTGphdmEvbGFuZy9PYmplY3Q7ABNbTGphdmEvbGFuZy9TdHJpbmc7AAFhAAthY2Nlc3NG" + 
    "bGFncwAIYWN0aXZpdHkACGFkZEZsYWdzAAZhcHBlbmQAC2FzSW50ZXJmYWNlAAFiAAZiaW5kZXIA" + 
    "D2Jyb2FkY2FzdEludGVudABGYnJvYWRjYXN0SW50ZW50IGZhaWxzIG9uIEFuZHJvaWQgOC4wIG9y" + 
    "IDguMSwgZmFsbGJhY2sgdG8gc3RhcnRBY3Rpdml0eQABYwAKY2FuRXhlY3V0ZQAIY2FuV3JpdGUA" + 
    "BWNobW9kABFjb20uYW5kcm9pZC5zaGVsbAANY3JlYXRlQ2hvb3NlcgABZAAEZGF0YQAGZXF1YWxz" + 
    "AANlcnIABmV4aXN0cwAEZXhpdAAFZmx1c2gABmZvcm1hdAARZ2V0RGVjbGFyZWRNZXRob2QADWdl" + 
    "dE1haW5Mb29wZXIACmdldE1lc3NhZ2UAC2dldFByb3BlcnR5AApnZXRTZXJ2aWNlABRnZXRTeXN0" + 
    "ZW1DbGFzc0xvYWRlcgAGZ2V0ZW52AAZnZXR1aWQABmludm9rZQALaXNEaXJlY3RvcnkAB2lzRW1w" + 
    "dHkAEWphdmEubGlicmFyeS5wYXRoAAlsb2FkQ2xhc3MABGxvb3AABG1haW4ABm1rZGlycwAfbW9l" + 
    "LnNoaXp1a3UubWFuYWdlci5zaGVsbC5TaGVsbAAabW9lLnNoaXp1a3UucHJpdmlsZWdlZC5hcGkA" + 
    "BG5hbWUACm9uVHJhbnNhY3QAEXBhdGhTZXBhcmF0b3JDaGFyAARwb3N0AAtwb3N0RGVsYXllZAAR" + 
    "cHJlcGFyZU1haW5Mb29wZXIAD3ByaW50U3RhY2tUcmFjZQAHcHJpbnRsbgAJcHV0QmluZGVyAAhw" + 
    "dXRFeHRyYQAKcmVhZFN0cmluZwAQcmVhZFN0cm9uZ0JpbmRlcgAqcmlra2Euc2hpenVrdS5pbnRl" + 
    "bnQuYWN0aW9uLlJFUVVFU1RfQklOREVSAANydW4ACnNldFBhY2thZ2UAE3N0YXJ0QWN0aXZpdHlB" + 
    "c1VzZXIACHRvU3RyaW5nAAV2YWx1ZQCYAX5+Ujh7ImJhY2tlbmQiOiJkZXgiLCJjb21waWxhdGlv" + 
    "bi1tb2RlIjoicmVsZWFzZSIsImhhcy1jaGVja3N1bXMiOmZhbHNlLCJtaW4tYXBpIjoyMywicGct" + 
    "bWFwLWlkIjoiNGFhZDI2ZCIsInI4LW1vZGUiOiJjb21wYXRpYmlsaXR5IiwidmVyc2lvbiI6Ijgu" + 
    "MC40NiJ9AAIYAYwBGCoCGQJSBAF7HgABAQEAkSAAgaAE7A8BEYgQAAIBAQGRIAGRIAKBoATUEAMR" + 
    "9BAAAAEBOIGABLgVORHMFAQABAAHCQEJAQkBGTqJgATQFQGBgATwFQEJhBgBCYgWAAIAAABpGQAA" + 
    "cBkAAMwZAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAEAAAAAAAAAAQAAAI4AAABwAAAAAgAAADAAAACo" + 
    "AgAAAwAAACUAAABoAwAABAAAAAsAAAAkBQAABQAAAD4AAAB8BQAABgAAAAQAAABsBwAAASAAAAoA" + 
    "AADsBwAAAyAAAAMAAACXDQAAARAAABgAAACsDQAAAiAAAI4AAACgDgAABCAAAAIAAABpGQAAACAA" + 
    "AAQAAAB4GQAAAxAAAAEAAADMGQAABiAAAAEAAADYGQAAABAAAAEAAADoGQAA";

    const rish_path = rish_dir + "rish";
    const rish_shizuku_path = rish_dir + "rish_shizuku.dex";

    if (files.exists(rish_path) && files.exists(rish_shizuku_path))
    {
        console.log("rish and rish_shizuku.dex exist");
    }
    else
    {
        files.write(rish_path + ".base64", rish_base64);
        files.write(rish_shizuku_path + ".base64", rish_shizuku_base64);
    
        let command = "base64 -d " + rish_path + ".base64" + " > " + rish_path;
        console.log(command);
        shell(command);
    
        command = "base64 -d " + rish_shizuku_path + ".base64" + " > " + rish_shizuku_path;
        console.log(command);
        shell(command);
    
        command = "rm -f " + rish_path + ".base64";
        shell(command);
    
        command = "rm -f " + rish_shizuku_path + ".base64";
        shell(command);

        console.log("create rish and rish_shizuku.dex success");
    }

    rish_sh.exec("cd " + rish_dir);
    rish_sh.exec("sh rish");
    detect_rish_sh.exec("cd " + rish_dir);
    detect_rish_sh.exec("sh rish");

    detect_rish_sh.setCallback({
        onOutput: function(outputStr) {
            appPackageNameList.forEach(packageName => {
                if (isAppOpen(outputStr, packageName)) {
                    handleAppOpen(packageName);
                }
            });
        }
    })
}

function rish_shell(cmd) {
    console.log(cmd);
    rish_sh.exec(cmd);
}

function detect_rish_shell(cmd) {
    detect_rish_sh.exec(cmd);
}

function exitAppMethod() {
    let op = 1;

    if (op === 0) {
        home();
    } else if (op === 1) {
        if (currentApp) {
            rish_shell(`am force-stop ${currentApp}`);
        }
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
        callApi(`lifeup://api/toast?text=${encodeURIComponent(str)}&type=${type}&isLong=true`);
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

    console.log(`Starting activity with intent: ${decodeURIComponent(intent.toUri(0))}`);
    context.startActivity(intent);
}

// 处理查询金币结果
function handleQueryCoin(data) {
    let coinValue = data.value;
    console.log(`handleQueryCoin: coinValue = ${coinValue}`);
    if (coinValue > 0) {
        callApi(`lifeup://api/query?key=item&item_id=${currentItemId}&broadcast=${queryItemString}`);
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
        confirmUseItem(false);
    } else {
        if (currentItemId === REST_COUPON_ID) { // 休息券不足时查询APP专属商品
            for (let item of itemInfo) {
                if (item.app === currentApp) {
                    currentItemId = parseInt(item.id);
                    console.log(`尝试使用APP专属券: itemId = ${currentItemId}`);
                    callApi(`lifeup://api/query?key=item&item_id=${currentItemId}&broadcast=${queryItemString}`);
                    return;
                }
            }
            currentItemId = FREE_COUPON_ID; // 如果没有APP专属商品，查询自由券
        } else if (currentItemId !== FREE_COUPON_ID) { // 查询自由券
            currentItemId = FREE_COUPON_ID; 
            console.log("尝试使用自由券");
            callApi(`lifeup://api/query?key=item&item_id=${currentItemId}&broadcast=${queryItemString}`);
        } else { // 所有商品都不足
            toastMethod("商品存货不足啦，继续完成任务吧！", toastType.WARNING_TYPE);
            console.log("商品数量不足，无法使用商品");
            setTimeout(() => { exitAppMethod(); resetState(); }, 500);
        }
    }
}

function useLifeUpCountDown() {
    threads.start(() => {
        // 跳转到商店页面
        callApi("lifeup://api/goto?page=main&sub_page=shop");

        do {
            // 等待并点击倒计时
            let ll_countdown = id("ll_countdown").findOne(2000);
            if (!ll_countdown) {
                toastMethod("未找到倒计时按钮", toastType.ERROR_TYPE);
                break;
            }
    
            ll_countdown.click();
            sleep(500);
    
            // 等待倒计时页面出现
            let countDownPage = text("商品倒计时").findOne(1000);
            if (!countDownPage) {
                toastMethod("倒计时页面加载失败", toastType.ERROR_TYPE);
                break;
            }
    
            // 匹配currentID对应的倒计时，开始倒计时
            let countDownItem = null;

            let item = findObjectById(itemTimeLeftInfoList, currentItemId)
            if (item) {
                countDownItem = textContains(item.name).findOne(1000);
            }
            
            if (!countDownItem) {
                toastMethod("未找到指定商品的倒计时", toastType.ERROR_TYPE);
                break;
            }
    
            let parent = countDownItem.parent();
            if (!parent) {
                toastMethod("无法获取倒计时元素的父级", toastType.ERROR_TYPE);
                break;
            }
    
            if (parent.childCount() < 3) {
                toastMethod("倒计时界面元素异常", toastType.ERROR_TYPE);
                break;
            }
    
            let btn_play = parent.child(1);
            if (!btn_play) {
                toastMethod("未找到开始倒计时的按钮", toastType.ERROR_TYPE);
                break;
            }
    
            btn_play.click();

            if (currentApp) {
                launch(currentApp);
            }
            
            return;
        } while (0);
    
        //异常处理
        setTimeout(() => { exitAppMethod(); resetState(); }, 500);
    });
}

function confirmUseItem(isCountDownTimeLeft) {
    let countDown = 5000;

    let view = ui.inflate(
        <vertical padding="16dp" background="#FFFFFF">
            <text id="title" textSize="22sp" textColor="#000000" gravity="left" textStyle="bold" text=""/>
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
        if (isCountDownTimeLeft) {
            useLifeUpCountDown();
        } else {
            callApi(`lifeup://api/use_item?id=${currentItemId}&use_times=1&broadcast=${useItemStatusString}`);
        }
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

    ui.run(() => {
        let words = isCountDownTimeLeft ? "倒计时" : "商品";
        view.title.setText(`确认使用${words}`);
        let item = null;

        if (isCountDownTimeLeft) {
            item = findObjectById(itemTimeLeftInfoList, currentItemId)
        } else {
            item = itemInfo.find(obj => { 
                if (!obj.app) {
                    return obj.id === currentItemId;
                } else {
                    return (obj.id === currentItemId) && (obj.app === currentApp);
                }
            });
        }

        console.log(JSON.stringify(item));
        view.prompt.setText(`确定使用${words}${item.name}吗？`);
    })
    
    dialog.setCancelable(false);
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
    updateItemTimeLeft(data.item_id, data.name, data.time_left);
    receiveCutDownEvt = true;
}

// 处理倒计时停止
function handleCountDownStop(data) {
    console.log("倒计时停止: " + JSON.stringify(data));
    let item_id = parseInt(data.item_id);
    updateItemTimeLeft(data.item_id, data.name, data.time_left);
    resetState();
}

// 处理倒计时完成
function handleCountDownComplete(data) {
    console.log("倒计时完成: " + JSON.stringify(data));
    let item_id = parseInt(data.item_id);
    updateItemTimeLeft(data.item_id, data.name, data.time_left);
    resetState();
}

function getFormattedDate(date) {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，所以需要加1
    let day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function isHoliday(date) {
    // 使用中国节假日API
    const apiUrl = 'https://timor.tech/api/holiday/info/' + date;

    try {
        let res = http.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });
        if (res.statusCode != 200) {
            console.error('请求失败，状态码: ' + res.statusCode);
            return false;
        }
        
        let data = res.body.string();
        let json = JSON.parse(data);

        console.log(data);

        if (json && json.type && (json.type.type === 1 || json.type.type === 2)) {
            return true; // 该日期是休息日
        } else {
            return false; // 该日期不是休息日
        }
    } catch (error) {
        console.error('请求过程中出现错误: ' + error);
        return false;
    }
}

function resetItem(itemName) {
    console.log("重置\"" + itemName + "\"");
    callApi(`lifeup://api/item?name=${itemName}&own_number=0&own_number_type=absolute`);
}

function addItem(itemName, number) {
    console.log("赠送\"" + itemName + "\" * " + number);
    callApi(`lifeup://api/item?name=${itemName}&own_number=${number}&own_number_type=relative`);
}

function performDailyTask() {
    console.log("开始执行每日定时任务");

    let dailyItemInfo = [
        { name: "自由券兑换券" },
        { name: "游戏兑换券" },
        { name: "抖音兑换券" },
        { name: "微博兑换券" },
        { name: "小红书兑换券" },
        { name: "b站兑换券" },
        { name: "知乎兑换券" },
        { name: "腾讯视频兑换券" },
    ];

    dailyItemInfo.forEach(item => {
        resetItem(item.name);
    });

    let currentDate = new Date();
    let formattedDate = getFormattedDate(currentDate);
    
    if (isHoliday(formattedDate)) {
        addItem("休息券", 12);
        addItem("节假日游戏券", 3);
    } else {
        resetItem("休息券");
        resetItem("节假日游戏券");
    }
}

function initDailyTask() {
    let execDailyTaskDateKey = "execDailyTaskDate";

    setInterval(() => {
        let execDailyTaskDate = lifeUpStorage.get(execDailyTaskDateKey, -1);
        let curDate = new Date().getDate();

        if (curDate !== execDailyTaskDate)
        {
            performDailyTask();
            lifeUpStorage.put(execDailyTaskDateKey, curDate);
        }
    }, 60 * 1000);
}

// 开始监听APP运行
function startMonitoringApps() {
    if (timerId) {
        console.log("监听APP运行定时器已创建");
        return;
    }

    console.log("开始监听APP运行");

    timerId = setInterval(() => {
        detect_rish_shell(foreground_app);
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
                for (let item of itemInfo) {
                    if (item.app === currentApp) {
                        let itemTimeInfo = findObjectById(itemTimeLeftInfoList, item.id);
                        if (itemTimeInfo && itemTimeInfo.time_left > 0) {
                            currentItemId = item.id;
                            break;
                        }

                        itemTimeInfo = findObjectById(itemTimeLeftInfoList, REST_COUPON_ID);
                        if (itemTimeInfo && itemTimeInfo.time_left > 0) {
                            currentItemId = REST_COUPON_ID;
                            break;
                        }

                        itemTimeInfo = findObjectById(itemTimeLeftInfoList, FREE_COUPON_ID);
                        if (itemTimeInfo && itemTimeInfo.time_left > 0) {
                            currentItemId = FREE_COUPON_ID;
                            break;
                        }

                        break;
                    }
                }
                
                if (currentItemId !== 0) {
                    confirmUseItem(true);
                } else {
                    handleAppOpenWithoutItem(packageName);
                }
            } else if (currentItemId !== FREE_COUPON_ID && 
                       currentItemId !== REST_COUPON_ID) {
                let filteredObjects = itemInfo.filter(obj => obj.id === currentItemId);
                let appExists = filteredObjects.some(obj => obj.app === packageName);

                if (!appExists) {
                    const namesArray = filteredObjects.map(obj => obj.name);
                    let nameString = namesArray.join(', ');
                    
                    toastMethod(`商品指定${nameString}了，快切换到${nameString}吧`, toastType.WARNING_TYPE);
                    console.log("未授权的应用，返回桌面");
                    setTimeout(() => { exitAppMethod(); currentApp = null; }, 500);
                }
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
    currentItemId = REST_COUPON_ID; // 尝试使用休息券
    callApi("lifeup://api/query?key=coin&broadcast=" + queryCoinString);
}

function isAppOpen(inputString, packageName) {
    let escapedPackageName = packageName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    let regexString = `windows=\\[Window.*${escapedPackageName}`;
    let regex = new RegExp(regexString);

    return regex.test(inputString);
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
    switchAppTime = 0;
}

// 初始化
function init() {
    init_iteminfo();
    init_rish_shell();
    initDailyTask();

    //通过rish shell授权无障碍权限
    rish_shell(open_autojs_accessibility);

    for (let item of itemInfo) {
        if (item.app) {
            addAppToList(item.app);
        }
    }

    startMonitoringApps();
}

// 在程序退出时取消注册广播接收器
events.on("exit", function() {
    context.unregisterReceiver(receiver);
    console.log("BroadcastReceiver unregistered.");

    stopMonitoringApps();
    rish_sh.exit();
    detect_rish_sh.exit();
});

// 初始化
init();

// 保持脚本运行
setInterval(() => {}, 1000);