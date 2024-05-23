"ui";
//原作者：@沐泠(muling)
//感谢“@家(jia)”的指导😉❤️
//在原版的基础上增加了：
//HorizontalScrollView位置自动调整

(function () {
  //继承至ui.Widget
  util.extend(MagicIndicator, ui.Widget);

  function MagicIndicator() {
    ui.Widget.call(this);
    let labelPaint = new com.stardust.autojs.core.graphics.Paint();
    let labelRect = new android.graphics.RectF();
    labelPaint.setAntiAlias(true);
    labelPaint.setStyle(android.graphics.Paint.Style.FILL);
    labelRect.set(0, 0, 0, 0);
    let centerVH = 0;
    let tipheight = 0;
    let tipwidth = 0;
    let mTabs = [];
    let currentTab = 0;
    let mPager = null;
    let bgColor = colors.parseColor("#00ffffff");
    let mTextColorNormal = colors.parseColor("#88000000");
    let mTextColorLight = colors.parseColor("#ff000000");
    let mCursorColor = colors.parseColor("#55000000");
    let scope = this;
    this.defineAttr("w", (view, attr, value, defineSetter) => {
      view.attr("w", value);
    });
    this.defineAttr("h", (view, attr, value, defineSetter) => {
      view.attr("h", value);
    });
    this.defineAttr("backgroundColor", (view, attr, value, defineSetter) => {
      bgColor = colors.parseColor(value);
    });
    this.defineAttr("textColorLight", (view, attr, value, defineSetter) => {
      mTextColorLight = colors.parseColor(value);
    });
    this.defineAttr("textColorNormal", (view, attr, value, defineSetter) => {
      mTextColorNormal = colors.parseColor(value);
    });
    this.defineAttr("cursorColor", (view, attr, value, defineSetter) => {
      mCursorColor = colors.parseColor(value);
    });
    this.defineAttr("id", (view, attr, value, defineSetter) => {
      ui[value.replace("@+id/", "")] = view.getChildAt(0);
    });
    this.onViewCreated = function (view) {};
    this.onFinishInflation = function (view) {
      view.setHorizontalScrollBarEnabled(false);
      view.setOverScrollMode(android.view.View.OVER_SCROLL_NEVER);
      defineMethod.call(this, view.getChildAt(0));
    };

    function defineMethod(view) {
      view.setTabs = function (tabs) {
        var bgdb = new android.graphics.drawable.Drawable({
          draw: function (canvas) {
            canvas.drawARGB(colors.alpha(bgColor), colors.red(bgColor), colors.green(bgColor), colors.blue(bgColor));
            labelPaint.setColor(mCursorColor);
            canvas.drawRoundRect(labelRect, tipheight / 2, tipheight / 2, labelPaint);
          },
        });
        view.setBackgroundDrawable(bgdb);
        view.post(function () {
          log("view.post");
          log(view);
          log("scope.view");
          log(scope.view);
          if (scope.view.getChildCount() == 0) return;
          let tabV = view.getChildAt(0);
          tipheight = tabV.getMeasuredHeight();
          tipwidth = tabV.getMeasuredWidth();
          centerVH = view.getHeight() / 2;
          labelRect.set(tabV.getLeft(), centerVH - tipheight / 2, tabV.getRight(), centerVH + tipheight / 2);
          view.invalidate();
        });
        view.removeAllViews();
        mTabs = tabs;
        currentTab = 0;

        //使HorizontalScrollView根据distance的值进行滑动
        function HorizontalScrollViewScrollTo(distance) {
          log("滑动的距离：" + distance);
          log('view =')
          log(view)
          log('horizontalScrollView =')
          log(horizontalScrollView)
          let horizontalScrollView = view.getParent();
          horizontalScrollView.smoothScrollTo(distance, 0);
        }

        //获取itme的坐标位置
        function GetCoordinates(item) {
          const resources = context.getResources();
          const scale = resources.getDisplayMetrics().density;
          const dp2px = (dp) => Math.floor(dp * scale + 0.5);
          var view = item;
          var rect = new android.graphics.Rect();
          view.getBoundsOnScreen(rect);
          log(item.text() + "的左侧位置：" + rect.left);
          log(item.text() + "的右侧位置：" + rect.right);
          if (rect.right > device.width) {
            var distance = item.getRight() - device.width + dp2px(22);
            HorizontalScrollViewScrollTo(distance);
          }
          if (rect.left < 0) {
            var distance = item.getLeft() - dp2px(22);
            HorizontalScrollViewScrollTo(distance);
          }
        }
        for (let i = 0; i < tabs.length; i++) {
          let tab = tabs[i];
          let item = ui.inflate(
            <text id="_title" padding="8 4 8 4" textSize="16" layout_gravity="center" gravity="center" />,
            view
          );
          item.setTextColor(mTextColorNormal);
          item.setTag(i);
          item._title.setText(tab);
          item.click((view) => {
            mPager.setCurrentItem(view.getTag());
            GetCoordinates(view);
          });
          view.addView(item);
          view.setViewPager = function (pager) {
            mPager = pager;
            pager.setOnPageChangeListener({
              onPageScrolled: function (arg0I, arg1F, arg2F) {
                scroll(arg0I, arg1F);
              },
              onPageSelected: function (arg0I) {
                setTabLight(arg0I);
                GetCoordinates(view.getChildAt(arg0I));
              },
            });
          };
        }
        setTabLight(0);
      };

      function setTabLight(arg0) {
        let count = view.getChildCount();
        for (let i = 0; i < count; i++) {
          let cView = view.getChildAt(i);
          if (i == arg0) {
            cView.setTextColor(mTextColorLight);
          } else {
            cView.setTextColor(mTextColorNormal);
          }
        }
      }
      let lastPos = 0;
      let lastOffset = 0;

      function scroll(position, offset) {
        let direct = position > lastPos || (position == lastPos && offset > lastOffset) ? 1 : -1;
        lastOffset = offset;
        lastPos = position;
        let list = view;
        let sc = list.getParent();
        if (position == mTabs.length - 1) {
          labelRect.set(
            list.getChildAt(position).getLeft(),
            centerVH - tipheight / 2,
            list.getChildAt(position).getRight(),
            centerVH + tipheight / 2
          );
        } else {
          let l = (1 - offset) * list.getChildAt(position).getLeft() + offset * list.getChildAt(position + 1).getLeft();
          tipwidth =
            (1 - offset) * list.getChildAt(position).getWidth() + offset * list.getChildAt(position + 1).getWidth();
          labelRect.set(l, centerVH - tipheight / 2, l + tipwidth, centerVH + tipheight / 2);
        }
        view.invalidate();
      }
    }
  }
  MagicIndicator.prototype.render = function () {
    return (
      <HorizontalScrollView>
        <linear id="inner" paddingLeft="8" paddingRight="8" />
      </HorizontalScrollView>
    );
  };
  ui.registerWidget("MagicIndicator", MagicIndicator);
  return MagicIndicator;
})();

activity.getWindow().getDecorView().setSystemUiVisibility(android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
ui.statusBarColor("#EAEAEA");
ui.layout(
  <vertical>
    <appbar>
      <MagicIndicator
        bg="#F9F9F9"
        backgroundColor="#F9F9F9"
        cursorColor="#CC03A9F5"
        textColorLight="#F9F9F9"
        textColorNormal="#CC444444"
        id="mi"
        w="*"
        h="45"
      />
    </appbar>
    <viewpager id="pager">
      <text text="145" id="t1" textSize="16" bg="#CC8B8BFF" />
      <text text="123" textSize="16" bg="#CC8BFFC5" />
      <text text="321" textSize="16" bg="#CCFF8B8B" />
      <text text="hjhjjj" textSize="16" bg="#CC2E97FF" />
      <text text="hahxycjd" textSize="16" bg="#CCFFC58B" />
    </viewpager>
  </vertical>
);

ui.mi.setTabs(["a", "abcd", "abcdefg", "abcdefgabcdefgabcdefg", "abcdefgabcdefg"]);
ui.mi.setViewPager(ui.pager);
