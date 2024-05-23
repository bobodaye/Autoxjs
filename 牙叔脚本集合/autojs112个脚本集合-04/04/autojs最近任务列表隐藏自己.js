let am = context.getSystemService(context.ACTIVITY_SERVICE);
if (am != null) {
  tasks = am.getAppTasks();
  if (tasks != null && tasks.size() > 0) {
    tasks.get(0).setExcludeFromRecents(true);
  }
}