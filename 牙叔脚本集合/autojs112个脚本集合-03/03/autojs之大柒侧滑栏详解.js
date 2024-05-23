/*
 * @Author: 大柒
 * @QQ: 531310591@qq.com
 * @Date: 2020-04-05 10:18:50
 * @Version: Auto.Js Pro
 * @Description:
 * @LastEditors: 牙叔
 * @LastEditTime: 2021-09-27 16:26:42
 */
"ui";
importClass(android.view.View);
// 状态栏背景透明, 不加的话, 状态栏是绿色, 默认的主题色
ui.statusBarColor(colors.TRANSPARENT);

const resources = context.getResources();
// 四舍五入 转化到px, 最小 1 像素
const statusBarHeight = resources.getDimensionPixelSize(
  resources.getIdentifier("status_bar_height", "dimen", "android")
);
// 密度比例
const scale = resources.getDisplayMetrics().density;
var dp2px = (dp) => {
  return Math.floor(dp * scale + 0.5);
};
var px2dp = (px) => {
  return Math.floor(px / scale + 0.5);
};

// 全屏有两种 SYSTEM_UI_FLAG_FULLSCREEN 和 SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
// SYSTEM_UI_FLAG_FULLSCREEN: 真正的全屏
// SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN: 真正全屏的基础上, 状态栏部分被遮挡
// SYSTEM_UI_FLAG_LAYOUT_STABLE: 全屏和非全屏切换时，布局不要有大的变化
// SYSTEM_UI_FLAG_LIGHT_STATUS_BAR: 状态栏图标黑色
// 此篇文章有部分效果对比: https://blog.csdn.net/QQxiaoqiang1573/article/details/79867127
var SystemUiVisibility = (ve) => {
  var option =
    View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
    (ve ? View.SYSTEM_UI_FLAG_LAYOUT_STABLE : View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
  activity.getWindow().getDecorView().setSystemUiVisibility(option);
};

SystemUiVisibility(false);

var ButtonLayout = (function () {
  importClass(android.graphics.Color);
  importClass("androidx.core.graphics.drawable.DrawableCompat");
  util.extend(ButtonLayout, ui.Widget);
  function ButtonLayout() {
    ui.Widget.call(this);
    this.defineAttr("leftDrawable", (view, attr, value, defineSetter) => {
      view.widget.mLeftDrawable = value;
      var lDrawable = context.getResources().getDrawable(getResourceID(value));
      lDrawable.setBounds(0, 0, view.widget.mLeftDrawableSize, view.widget.mLeftDrawableSize);
      let wrappedDrawable = DrawableCompat.wrap(lDrawable);
      DrawableCompat.setTint(wrappedDrawable, Color.parseColor("#FFFFFF"));
      view.setCompoundDrawables(lDrawable, null, null, null);
    });
  }
  ButtonLayout.prototype.mLeftDrawable = null;
  ButtonLayout.prototype.mLeftDrawableSize = dp2px(20);
  ButtonLayout.prototype.render = function () {
    return (
      <TextView
        bg="?attr/selectableItemBackground"
        gravity="left|center_vertical"
        textColor="#FFFFFF"
        textStyle="normal"
        typeface="monospace"
        padding="20 10"
        drawablePadding="20"
      />
    );
  };

  function getResourceID(name) {
    var resource = context.getResources();
    return resource.getIdentifier(name, "drawable", context.getPackageName());
  }
  ui.registerWidget("button-layout", ButtonLayout);
  return ButtonLayout;
})();

// 布局结构
// viewpager
//   --relative
//     --relative
//     --frame
//     --horizontal
//   --card
//     --vertical
//       --toolbar
//       --card
ui.layout(
  <viewpager id="viewpager" bg="#426e6d">
    {/**drawer侧边栏 */}
    <relative w="*" clickable="true">
      <relative id="drawerToolbar" marginTop="10" paddingTop="{{statusBarHeight}}px">
        <img
          id="icon"
          w="40"
          h="40"
          margin="20 0"
          scaleType="fitXY"
          circle="true"
          src="https://pic.rmb.bdstatic.com/678bb17b2094432ef9e3d30019a3277e.jpeg"
        />

        <text
          id="title"
          layout_toRightOf="icon"
          layout_alignParentTop="true"
          w="auto"
          h="auto"
          text="Miroslava SavitsKaya"
          textSize="16sp"
          textStyle="bold"
          textColor="#ffffff"
          typeface="monospace"
        />

        <text
          id="subtitle"
          layout_toRightOf="icon"
          layout_below="title"
          w="auto"
          h="auto"
          text="Active status"
          textSize="12sp"
          textStyle="bold"
          textColor="#7fffffff"
          typeface="monospace"
        />
      </relative>

      <frame id="drawerFrame" layout_below="drawerToolbar" layout_above="drawerHorizontal" h="*">
        <list id="drawerList" w="auto" h="auto" padding="0 20" layout_gravity="center_vertical">
          <button-layout w="*" text="{{this.text}}" leftDrawable="{{this.drawable}}" />
        </list>
      </frame>

      <horizontal id="drawerHorizontal" paddingBottom="{{statusBarHeight}}px" layout_alignParentBottom="true">
        <button-layout id="settingsBtn" text="Sttings" leftDrawable="ic_settings_black_48dp" />

        <View bg="#ffffff" w="2px" h="16" layout_gravity="center_vertical" />

        <button-layout id="logBtn" text="Log out" drawablePadding="0" />
      </horizontal>
    </relative>

    {/**界面 */}
    <card id="card" cardElevation="0" cardCornerRadius="0" cardBackgroundColor="#FFFFFF">
      <vertical>
        <toolbar w="*" h="auto" marginTop="10" paddingTop="{{statusBarHeight}}px">
          <text
            w="*"
            h="auto"
            text="Se7en"
            textSize="21sp"
            textStyle="bold|italic"
            textColor="#3f000000"
            typeface="monospace"
            gravity="center"
          />

          <img
            id="icon"
            w="40"
            h="40"
            margin="20 0"
            scaleType="fitXY"
            circle="true"
            layout_gravity="right"
            src="https://pic.rmb.bdstatic.com/678bb17b2094432ef9e3d30019a3277e.jpeg"
          />
        </toolbar>

        <card
          w="*"
          h="*"
          marginTop="20"
          marginBottom="0"
          paddingBottom="30"
          cardElevation="0dp"
          cardCornerRadius="30dp"
        ></card>
      </vertical>
    </card>
  </viewpager>
);
// 删除第一页左侧阴影
// 删除最后一页右侧阴影
ui.viewpager.overScrollMode = View.OVER_SCROLL_NEVER; //删除滑动到底的阴影
// viewpager序号从0开始
ui.viewpager.currentItem = 1; //跳转到1号子页面
// 添加页面改变监听
// 显示半个页面是不会触发该事件的
// 只有某个页面整个显示出来才会触发
ui.viewpager.setOnPageChangeListener({
  onPageSelected: function (index) {
    log("index = " + index);
    SystemUiVisibility(index ? false : true);
  },
});

// viewpager参考文章
// https://blog.csdn.net/u012702547/article/details/52334161

// setPageTransformer(boolean reverseDrawingOrder, PageTransformer transformer) 用于设置ViewPager切换时的动画效果
ui.viewpager.setPageTransformer(true, new MyPageTransform()); //设置viewpager切换动画
// ui.viewpager.setPageTransformer(false, new MyPageTransform()); //设置viewpager切换动画

var items = [
  {
    text: "Adoption",
    drawable: "ic_pets_black_48dp",
  },
  {
    text: "Donation",
    drawable: "ic_folder_shared_black_48dp",
  },
  {
    text: "Add pet",
    drawable: "ic_games_black_48dp",
  },
  {
    text: "Favorites",
    drawable: "ic_favorite_black_48dp",
  },
  {
    text: "Messages",
    drawable: "ic_email_black_48dp",
  },
  {
    text: "Profile",
    drawable: "ic_person_black_48dp",
  },
];
ui.drawerList.setDataSource(items);
// 删除android ScrollView边界阴影方法方法
// android:fadingEdge=”none”
// 删除ScrollView拉到尽头（顶部、底部），然后继续拉出现的阴影效果
// android:overScrollMode="never"
ui.drawerList.overScrollMode = View.OVER_SCROLL_NEVER;
ui.drawerList.on("item_click", (item) => {
  //列表控件点击事件
  engines.execScript("new Actvity", "'ui';var Config=engines.myEngine().execArgv;eval(Config.load)();", {
    arguments: {
      load: newActivity.toString(),
      config: {
        title: item.text,
      },
    },
  });
});

ui.settingsBtn.on("click", () => {
  toastLog("Settings");
});

ui.logBtn.on("click", () => {
  toastLog("Log out");
});

/**
 * 自定义viewpager动画
 */
function MyPageTransform() {
  var mDp30 = dp2px(30);
  var mRadius = 0;
  var pageWidth;
  /**
   * position取值特点：
   * 假设页面从0～1，则：
   * 第一个页面position变化为[0,-1]
   * 第二个页面position变化为[1,0]
   */
  // 手指从左往右滑动
  // 第1页, 也就是CardView, position 从0到1
  // 第0页, 也就是JsRelativeLayout, position 从-1到0
  // 请想想一个线段
  // -1 -----------------0------------------- 1
  // 页面滑到右侧就是1
  // 页面滑到左侧就是-1
  //  03-19 14:11:34.729 main/D: view: com.stardust.autojs.core.ui.widget.JsRelativeLayout{975adcd VFE...C.. ......ID -1080,0-0,1792}, position: -1
  //  03-19 14:11:34.734 main/D: view: androidx.cardview.widget.CardView{4acc666 V.E...... ......ID 0,0-1080,1792 #133a2c4}, position: 0
  //  03-19 14:11:42.804 main/D: view: com.stardust.autojs.core.ui.widget.JsRelativeLayout{975adcd VFE...C.. ......ID -1080,0-0,1792}, position: -0.8370370268821716
  //  03-19 14:11:42.809 main/D: view: androidx.cardview.widget.CardView{4acc666 V.E...... ......ID 0,0-1080,1792 #133a2c4}, position: 0.16296295821666718
  //  03-19 14:11:42.819 main/D: view: com.stardust.autojs.core.ui.widget.JsRelativeLayout{975adcd VFE...C.. ......ID -1080,0-0,1792}, position: -0.7064814567565918
  //  03-19 14:11:42.822 main/D: view: androidx.cardview.widget.CardView{4acc666 V.E...... ......ID 0,0-1080,1792 #133a2c4}, position: 0.2935185134410858
  //  03-19 14:11:42.829 main/D: index = 0
  //  03-19 14:11:42.850 main/D: view: com.stardust.autojs.core.ui.widget.JsRelativeLayout{975adcd VFE...C.. ........ -1080,0-0,1792}, position: -0.0962962955236435
  //  03-19 14:11:42.854 main/D: view: androidx.cardview.widget.CardView{4acc666 V.E...... ........ 0,0-1080,1792 #133a2c4}, position: 0.9037036895751953
  //  03-19 14:11:42.873 main/D: view: com.stardust.autojs.core.ui.widget.JsRelativeLayout{975adcd VFE...C.. ........ -1080,0-0,1792}, position: -0.05462963134050369
  //  03-19 14:11:42.877 main/D: view: androidx.cardview.widget.CardView{4acc666 V.E...... ........ 0,0-1080,1792 #133a2c4}, position: 0.9453703761100769
  //  03-19 14:11:42.886 main/D: view: com.stardust.autojs.core.ui.widget.JsRelativeLayout{975adcd VFE...C.. ........ -1080,0-0,1792}, position: -0.01944444514811039
  //  03-19 14:11:42.889 main/D: view: androidx.cardview.widget.CardView{4acc666 V.E...... ........ 0,0-1080,1792 #133a2c4}, position: 0.980555534362793
  //  03-19 14:11:42.898 main/D: view: com.stardust.autojs.core.ui.widget.JsRelativeLayout{975adcd VFE...C.. ........ -1080,0-0,1792}, position: -0.0055555556900799274
  //  03-19 14:11:42.901 main/D: view: androidx.cardview.widget.CardView{4acc666 V.E...... ........ 0,0-1080,1792 #133a2c4}, position: 0.9944444298744202
  //  03-19 14:11:42.911 main/D: view: com.stardust.autojs.core.ui.widget.JsRelativeLayout{975adcd VFE...C.. ........ -1080,0-0,1792}, position: -0.0009259259095415473
  //  03-19 14:11:42.914 main/D: view: androidx.cardview.widget.CardView{4acc666 V.E...... ........ 0,0-1080,1792 #133a2c4}, position: 0.9990741014480591
  //  03-19 14:11:42.928 main/D: view: com.stardust.autojs.core.ui.widget.JsRelativeLayout{975adcd VFE...C.. ........ -1080,0-0,1792}, position: 0
  //  03-19 14:11:42.930 main/D: view: androidx.cardview.widget.CardView{4acc666 V.E...... ........ 0,0-1080,1792 #133a2c4}, position: 1

  this.transformPage = function (view, position) {
    pageWidth = view.getWidth();
    log(util.format("view: %s, pageWidth: %s, position: %s", view, pageWidth, position));
    if (position < -1) {
      view.setAlpha(0); // 这个我觉得没啥用, 因为没有小于-1的值(也可能我理解有误)
    } else if (position <= 0) {
      // 左侧view
      // 小于0, position不是一个固定的数字, 他是一直在变化的
      view.setTranslationX(pageWidth * position);
    } else if (position <= 1) {
      // 右侧view
      // 横轴的变化保证了第1页始终能看见
      // 就算最大的偏移也只有view宽度的一半
      view.setTranslationX(pageWidth * 0.5 * -position);
      // 缩放view的宽高
      view.setScaleX(1 - 0.3 * position);
      view.setScaleY(1 - 0.3 * position);
      // if (mRadius != parseInt(mDp30 * position)) {
      //圆角切换
      ui.card.attr("cardCornerRadius", (mRadius = parseInt(mDp30 * position)) + "px");
      // }
      if (position == 1) {
        // 设置list 宽度
        // 这样你点击有反应的区域就只有屏幕宽度*0.65
        ui.drawerList.attr("w", parseInt(pageWidth * 0.65) + "px");
      }
    } else {
      view.setAlpha(0);
    }
  };
}

function newActivity() {
  //新界面
  ui.layout(
    <vertical>
      <appbar>
        <toolbar id="toolbar" title="{{Config.config.title}}" />
      </appbar>

      <vertical h="*" gravity="center_vertical">
        <text h="auto" text="new Actvity" textSize="24sp" gravity="center_horizontal" />

        <text
          h="auto"
          text="{{Config.config.title}}"
          textSize="32sp"
          textStyle="bold"
          alpha="0.7"
          gravity="center_horizontal"
        />
      </vertical>
    </vertical>
  );
  activity.setSupportActionBar(ui.toolbar);
  // setHomeButtonEnabled这个小于4.0版本的默认值为true的。但是在4.0及其以上是false，该方法的作用：决定左上角的图标是否可以点击。没有向左的小图标。 true 图标可以点击  false 不可以点击。
  // actionBar.setDisplayHomeAsUpEnabled(true)    // 给左上角图标的左边加上一个返回的图标 。对应ActionBar.DISPLAY_HOME_AS_UP
  // actionBar.setDisplayShowHomeEnabled(true)   //使左上角图标是否显示，如果设成false，则没有程序图标，仅仅就个标题，否则，显示应用程序图标，对应id为android.R.id.home，对应ActionBar.DISPLAY_SHOW_HOME
  // actionBar.setDisplayShowCustomEnabled(true)  // 使自定义的普通View能在title栏显示，即actionBar.setCustomView能起作用，对应ActionBar.DISPLAY_SHOW_CUSTOM
  // actionBar.setDisplayShowTitleEnabled(true)   //对应ActionBar.DISPLAY_SHOW_TITLE。
  // 其中setHomeButtonEnabled和setDisplayShowHomeEnabled共同起作用，如果setHomeButtonEnabled设成false，即使setDisplayShowHomeEnabled设成true，图标也不能点击
  activity.getSupportActionBar().setDisplayHomeAsUpEnabled(true);
  ui.toolbar.setNavigationOnClickListener({
    onClick: function () {
      ui.finish();
    },
  });
}