const itemInfo = [
    { name: "自由券兑换券" },
    { name: "游戏兑换券" },
    { name: "抖音兑换券" },
    { name: "微博兑换券" },
    { name: "小红书兑换券" },
    { name: "b站兑换券" },
    { name: "知乎兑换券" },
    { name: "腾讯视频兑换券" },
];

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

function resetItem(itemName) {
    callApi("lifeup://api/item?name=" + itemName + "&own_number=0&own_number_type=absolute");
}

itemInfo.forEach(item => {
    console.log("重置\"" + item.name + "\"");
    resetItem(item.name);
});