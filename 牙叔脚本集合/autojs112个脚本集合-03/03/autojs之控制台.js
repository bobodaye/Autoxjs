importClass(Packages.androidx.recyclerview.widget.RecyclerView);
console.show();

console.setPosition(210, 330);

let mConsoleView = getConsoleWindow();

let parent = mConsoleView.parent;

var inputView = parent.findViewById(context.getResources().getIdentifier("input", "id", context.getPackageName()));
var buttonView = parent.findViewById(context.getResources().getIdentifier("submit", "id", context.getPackageName()));
ui.run(function () {
  inputView.setVisibility(8);
  buttonView.setVisibility(8);
});

function getConsoleWindow() {
  var mConsole = runtime.console;
  let field = mConsole.class.superclass.getDeclaredField("mConsoleFloaty");
  field.setAccessible(true);
  mConsoleFloaty = field.get(mConsole);
  mConsoleView = mConsoleFloaty.getExpandedView();
  return mConsoleView;
}

let r = filterView(mConsoleView);
function filterView(view, arr) {
  arr = arr || [];
  if (view instanceof android.view.ViewGroup) {
    arr.push(view);

    let childCount = view.childCount;
    for (var i = 0; i < childCount; i++) {
      let chileView = view.getChildAt(i);
      filterView(chileView, arr);
    }
  } else {
    arr.push(view);
  }
  return arr;
}

let num = 10;
ui.run(function () {
  let recycleview = r[num];
  let adapter = recycleview.getAdapter();
  // r[num].setBackgroundColor(colors.parseColor("#2ed573"));
  function createAdapter() {
    let result = new JavaAdapter(
      Packages[adapter.getClass().getName()],
      {
        onBindViewHolder: function (vh, i) {
          adapter.onBindViewHolder(vh, i);
          vh.textView.setTextSize(30);
          vh.textView.setTextColor(colors.parseColor("#2ed573"));
        },
      },
      recycleview.parent.parent,
      null
    );
    return result;
  }
  let newAdapter = createAdapter();
  recycleview.setAdapter(newAdapter);
});

console.log("AutoJsPro教程  \n牙叔");

let arr = [
  "android.widget.RelativeLayout{9308131 V.E...... ......I. 0,0-0,0}", // 整个控制台的父view
  "android.widget.LinearLayout{73d1bee V.E...... ......ID 36,36-924,1683}",
  "android.widget.LinearLayout{2d85df2 V.E...... ......ID 0,0-888,120}",
  "android.widget.TextView{e4232c0 V.ED..... ......ID 48,0-528,120 #7f0902e7 app:id/title}",
  "android.widget.LinearLayout{e264bf9 V.E...... ......ID 528,0-888,120}",
  "android.widget.ImageView{d0a673e VFED..C.. ......ID 0,0-120,120 #7f0901dc app:id/minimize}",
  "android.widget.ImageView{d7099f VFED..C.. ......ID 120,0-240,120 #7f0901e9 app:id/move_or_resize}",
  "android.widget.ImageView{77baec VFED..C.. ......ID 240,0-360,120 #7f0900de app:id/close}",
  "com.stardust.autojs.core.console.ConsoleView{debec43 V.E...... ......ID 0,120-888,1647 #7f0900e9 app:id/console}",
  "android.widget.LinearLayout{b952908 V.E...... ......ID 0,0-888,1527}",
  "androidx.recyclerview.widget.RecyclerView{c76aeb5 VFED..... .F...... 0,0-648,328 #7f0901a5 app:id/logList}",
  "android.widget.LinearLayout{cc1b94a VFE...C.. ........ 24,328-648,448 #7f090185 app:id/inputContainer}",
  "android.widget.EditText{e2ca0bb VFED..CL. ......I. 0,13-360,133 #7f090184 app:id/input}",
  "android.widget.Button{d9b99d8 VFED..C.. ......I. 360,0-624,120 #7f0902bb app:id/submit}",
  "android.widget.ImageView{a10b84d G.ED..... ......I. 0,0-0,0 #7f090247 app:id/resizer}",
  "android.widget.ImageView{9c80250 G.ED..... ......I. 0,0-0,0 #7f0901e8 app:id/move_cursor}",
];