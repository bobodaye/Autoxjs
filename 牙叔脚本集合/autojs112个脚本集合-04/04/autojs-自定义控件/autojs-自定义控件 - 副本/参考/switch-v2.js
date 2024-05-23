/*
 * @Author: 大柒
 * @QQ: 531310591@qq.com
 * @Date: 2020-05-28 20:23:36
 * @Version: Auto.Js Pro 7.0.2-1 Android 9
 * @Description: 自定义控件:SwitchWidget-Se7en 0.0.2
 * @LastEditors: 牙叔
 * @LastEditTime: 2021-07-29 00:20:26
 */
"ui";

const SwitchWidget = (function () {
  importClass(android.view.Gravity);
  importClass(android.graphics.PorterDuff);
  importClass(android.content.res.ColorStateList);
  importClass(android.graphics.drawable.LayerDrawable);
  importClass(android.graphics.drawable.GradientDrawable);
  const resources = context.getResources();
  const scale = resources.getDisplayMetrics().density;
  util.extend(SwitchWidget, ui.Widget);

  function SwitchWidget() {
    ui.Widget.call(this);
    //trackColor 开关轨道选中颜色
    this.defineAttr("trackColor", (view, attr, value, defineSetter) => {
      view.widget.$trackColor = value;
    });
    this.defineAttr("thumbSize", (view, attr, value, defineSetter) => {
      view.setThumbSize(eval(value));
    });
    this.defineAttr("radius", (view, attr, value, defineSetter) => {
      view.setRadius(eval(value));
    });
  }

  SwitchWidget.prototype.$trackColor = "#4cb0f9";

  SwitchWidget.prototype.render = function () {
    return <Switch />;
  };

  SwitchWidget.prototype.onViewCreated = function (view) {
    view.setTrackTintMode(PorterDuff.Mode.SRC);
    /** view event */
    view.createColorStateList = function (normal, checked) {
      return createColorStateList(normal, checked);
    };
    view.setThumbSize = function (dp) {
      mSize = dp;
      updateSize();
    };
    view.setRadius = function (dp) {
      mRadius = dp;
      updateRadius();
    };
    /** Drawable Config */
    let mSize = 24;
    let mRadius = mSize / 2;
    /** Track Drawable */
    let mTrackgd = view.getTrackDrawable().getDrawable(0);
    let mTrackld = new LayerDrawable([mTrackgd]);
    /** Thumb Drawable */
    let mThumbgd = new GradientDrawable();
    let mThumbld = new LayerDrawable([mThumbgd]);
    /** update Drawable */
    mTrackld.setPadding(dp2px(1), 0, 0, 0);
    mThumbld.setLayerGravity(0, Gravity.CENTER_VERTICAL);
    updateSize();
    updateRadius();

    function updateSize() {
      mTrackld.setLayerWidth(0, dp2px(mSize * 2 - 2));
      mTrackld.setLayerHeight(0, dp2px(mSize));
      mThumbld.setLayerWidth(0, dp2px(mSize - 2));
      mThumbld.setLayerHeight(0, dp2px(mSize - 2));
      updateViewDrawable();
    }

    function updateRadius() {
      mTrackgd.setCornerRadius(dp2px(mRadius));
      mThumbgd.setCornerRadius(dp2px(mRadius - 1));
      updateViewDrawable();
    }

    function updateViewDrawable() {
      mTrackld.setDrawable(0, mTrackgd);
      mThumbld.setDrawable(0, mThumbgd);
      view.setTrackDrawable(mTrackld);
      view.setThumbDrawable(mThumbld);
      /** Switch Thumb Track TintList */
      view.setThumbTintList(createColorStateList("#FFFFFF", "#FFFFFF"));
      view.setTrackTintList(createColorStateList("#7A999999", view.widget.$trackColor));
    }
  };

  SwitchWidget.prototype.onFinishInflation = function (view) {
    /** Switch Thumb Track TintList */
    view.setThumbTintList(createColorStateList("#FFFFFF", "#FFFFFF"));
    view.setTrackTintList(createColorStateList("#7A999999", view.widget.$trackColor));
  };

  function dp2px(dp) {
    return parseInt(Math.floor(dp * scale + 0.5));
  }

  function createColorStateList(normal, checked) {
    let __attrs__ = new Array(2);
    __attrs__[0] = [-android.R.attr.state_checked];
    __attrs__[1] = [android.R.attr.state_checked];
    let __colors__ = new Array(2);
    __colors__[0] = colors.parseColor(normal);
    __colors__[1] = colors.parseColor(checked);
    return new ColorStateList(__attrs__, __colors__);
  }

  ui.registerWidget("SwitchWidget-Se7en", SwitchWidget);
  return SwitchWidget;
})();

ui.layout(
  <vertical padding="4">
    <SwitchWidget-Se7en
      margin="8 4"
      padding="8 15"
      checked="true"
      text="SwitchWidget-Se7en"
      background="@android:drawable/editbox_background"
    />
    <SwitchWidget-Se7en
      margin="8 4"
      padding="8 15"
      checked="true"
      text="trackColor"
      trackColor="#003366"
      radius="8"
      background="@android:drawable/editbox_background"
    />
    <SwitchWidget-Se7en
      margin="8 4"
      padding="8 15"
      checked="true"
      text="trackColor"
      thumbSize="35"
      radius="35"
      trackColor="#4BD963"
      background="@android:drawable/editbox_background"
    />
    <SwitchWidget-Se7en
      margin="8 4"
      padding="8 15"
      checked="true"
      text="trackColor"
      thumbSize="35"
      radius="0"
      trackColor="#66CCCC"
      background="@android:drawable/editbox_background"
    />

    <text id="size_title" text="开关大小:24dp" />
    <seekbar id="size" progress="24" />
    <text id="radius_title" text="开关圆角:12dp" />
    <seekbar id="radius" progress="12" />
    <SwitchWidget-Se7en
      id="switch"
      margin="8 4"
      padding="8 15"
      checked="true"
      text="trackColor"
      trackColor="#CC3333"
      background="@android:drawable/editbox_background"
    />
  </vertical>
);

ui.size.setOnSeekBarChangeListener({
  onProgressChanged: function (view, p) {
    ui.size_title.setText("开关大小:" + p + "dp");
    ui.switch.setThumbSize(p);
  },
});

ui.radius.setOnSeekBarChangeListener({
  onProgressChanged: function (view, p) {
    ui.radius_title.setText("圆角:" + p + "dp");
    ui.switch.setRadius(p);
  },
});
