"ui";

ui.emitter.on("back_pressed", (e) => {
    dialogs.build({
        title: "保存文件？",
        content: "是否在退出前保存文件？",
        positive: "保存",
        negative: "放弃",
        neutral: "取消",
        canceledOnTouchOutside: false,
        autoDismiss: true,
    }).on("any", (action, dialog) => {
        if (action == "positive") {
            toast("你点击了确定");
            ui.finish();
        } else if (action == "negative") {
            toast("你点击了取消");
            ui.finish();
        }
    }).show();
    e.consumed = true;
});

setInterval(() => { }, 1000);