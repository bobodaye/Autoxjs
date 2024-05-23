"ui";
engines.all().map((ScriptEngine) => {
  if (engines.myEngine().toString() !== ScriptEngine.toString()) {
    ScriptEngine.forceStop();
  }
});
importClass("androidx.appcompat.view.menu.MenuBuilder");
importClass("androidx.appcompat.widget.ActionMenuPresenter");
importClass(com.google.android.material.bottomnavigation.BottomNavigationView);
activity.setTheme(com.google.android.material.R$style.Theme_MaterialComponents_DayNight_DarkActionBar);

ui.layout(
  <vertical>
    <text text="自定义底部导航栏" margin="0 0 0 10" textColor="#d9000000" textSize="35sp" w="*" gravity="center"></text>
    <text
      text="--牙叔教程 简单易懂"
      margin="0 0 0 10"
      textColor="#80000000"
      textSize="25sp"
      w="*"
      gravity="center"
      layout_height="0dp"
      layout_weight="1"
    ></text>
    <androidx.coordinatorlayout.widget.CoordinatorLayout layout_width="match_parent" layout_height="200dp">
      <com.google.android.material.bottomappbar.BottomAppBar
        android:id="@+id/bottomAppBar"
        backgroundTint="#009688"
        layout_width="match_parent"
        layout_height="69dp"
        layout_gravity="bottom"
        paddingStart="0dp"
        paddingEnd="0dp"
      >
        <com.google.android.material.bottomnavigation.BottomNavigationView
          android:id="@+id/bottomNavigationView"
          android:layout_width="match_parent"
          android:layout_height="wrap_content"
          android:layout_gravity="bottom"
          android:background="#00DDE4F6"
          app:layout_constraintBottom_toBottomOf="parent"
          app:layout_constraintEnd_toEndOf="parent"
          app:layout_constraintStart_toStartOf="parent"
        />
      </com.google.android.material.bottomappbar.BottomAppBar>
      <com.google.android.material.floatingactionbutton.FloatingActionButton
        layout_width="wrap_content"
        layout_height="wrap_content"
        id="btn_report"
        src="@drawable/ic_account_circle_black_48dp"
        contentDescription="牙叔教程"
        app:layout_anchor="@id/bottomAppBar"
      />
    </androidx.coordinatorlayout.widget.CoordinatorLayout>
  </vertical>
);

fab = ui.btn_report;
p = fab.getLayoutParams();
p.setAnchorId(ui.bottomAppBar.getId());
fab.setLayoutParams(p);
ui.bottomAppBar.setFabCradleMargin(20); // FAB边缘与通讯BottomAppBar座切口之间的距离。默认为5dp。
ui.bottomAppBar.setFabCradleRoundedCornerRadius(30); // 通讯BottomAppBar座切口的拐角半径。默认为8dp。就上上坡的哪里
ui.bottomAppBar.setCradleVerticalOffset(30); // FAB相对于通讯BottomAppBar座切口的垂直偏移距离。默认值为0dp，表示FAB中心将与的顶部对齐BottomAppBar。
setTimeout(function () {
  ui.bottomAppBar.fabAnimationMode = 0;
  ui.bottomAppBar.fabAlignmentMode = 1;
}, 1000);

setTimeout(function () {
  ui.bottomAppBar.fabAnimationMode = 1;
  ui.bottomAppBar.fabAlignmentMode = 0;
}, 2000);
// printObj(ui.btn_report);
function printObj(obj) {
  var arr = [];
  for (var k in obj) {
    arr.push(k);
  }
  arr.sort();
  log(arr);
}