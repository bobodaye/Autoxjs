importClass(Packages.androidx.recyclerview.widget.RecyclerView);
importClass(Packages.androidx.recyclerview.widget.LinearLayoutManager);
importClass(android.graphics.drawable.BitmapDrawable);
importClass(Packages.androidx.recyclerview.widget.DividerItemDecoration);
importClass(android.graphics.BitmapFactory);
importClass(android.graphics.Paint);
importClass(android.graphics.Color);

console.show();
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

r[3].setText("牙叔");
let num = 10;
let path = "./睡美人.jpg";
let bgBmp = BitmapFactory.decodeFile(files.path(path));
ui.run(function () {
  let recycleview = r[num];
  let adapter = recycleview.getAdapter();
  function createAdapter() {
    let result = new JavaAdapter(
      Packages[adapter.getClass().getName()],
      {
        onCreateViewHolder: function (parent, viewType) {
          let holder = adapter.onCreateViewHolder(parent, viewType);
          // 设置背景色
          // holder.itemView.setBackgroundColor(colors.parseColor("#f1f2f6"));
          // 设置背景图片
          holder.itemView.setBackgroundDrawable(new BitmapDrawable(bgBmp));
          holder.textView.setTextSize(25);
          return holder;
        },

        onBindViewHolder: function (vh, i) {
          adapter.onBindViewHolder(vh, i);
          if (i % 3 === 0) {
            vh.textView.setTextColor(colors.parseColor("#2ed573"));
          } else {
            vh.textView.setTextColor(colors.parseColor("#332ed573"));
          }
        },
      },
      recycleview.parent.parent,
      null
    );
    return result;
  }

  var iconName = "ic_cloud_circle_black_48dp";
  var icon = getResourceID(iconName, "drawable");
  function getResourceID(name, defType) {
    var resource = context.getResources();
    return resource.getIdentifier(name, defType, context.getPackageName());
  }
  let options = new BitmapFactory.Options();
  options.inSampleSize = 2;
  let mBmp = BitmapFactory.decodeResource(context.getResources(), icon, options);
  let mBmpWidth = mBmp.getWidth();
  let mPaint = new Paint();
  mPaint.setColor(Color.RED);
  recycleview.addItemDecoration(
    new RecyclerView.ItemDecoration({
      onDraw: function (c, parent, state) {
        if (!state) {
          return false;
        }
        this.super$onDraw(c, parent, state);
        let childCount = parent.getChildCount();
        for (let i = 0; i < childCount; i++) {
          let child = parent.getChildAt(i);
          c.drawBitmap(mBmp, 6, child.getTop(), mPaint);
        }
      },
      onDrawOver: function (c, parent, state) {
        if (!state) {
          return false;
        }
        this.super$onDrawOver(c, parent, state);
        let manager = parent.getLayoutManager();
        let childCount = parent.getChildCount();
        for (let i = 0; i < childCount; i++) {
          let child = parent.getChildAt(i);
          let left = manager.getLeftDecorationWidth(child);
          let radius = 20;
          let cx = left + child.getWidth() - radius - 16;
          let cy = child.getTop() + child.getHeight() / 2;
          c.drawCircle(cx, cy, radius, mPaint);
        }
      },
      getItemOffsets: function (outRect, view, parent, state) {
        if (!state) {
          return false;
        }
        this.super$getItemOffsets(outRect, view, parent, state);
        outRect.left = mBmpWidth + 12;
        outRect.bottom = 2;
      },
    })
  );

  let newAdapter = createAdapter();
  recycleview.setAdapter(newAdapter);
});

for (var i = 0; i < 30; i++) {
  console.log("AutoJsPro教程  \n牙叔  " + i);
}

let consoleWidth = parseInt((device.width / 5) * 4);
let consoleHeight = parseInt((device.height / 5) * 4);
console.setSize(consoleWidth, consoleHeight);
console.setPosition((device.width - consoleWidth) / 2, (device.height - consoleHeight) / 2);