import tkinter as tk
from tkinter import messagebox, ttk
from tkcalendar import Calendar
import requests
import datetime
import urllib.parse
import os

BASE_URL = None
FONT = ("Fira Sans", 12)
TASK_FONT = ("SimHei", 14)
TITLE_FONT = ("SimHei", 16)
SETTINGS_FILE = "lifeup_settings.cfg"

class TaskManagerApp:
    def __init__(self, master):
        self.master = master
        self.master.title("LifeUp客户端")
        self.master.geometry("800x600")
        self.center_window(self.master)

        self.set_styles()  # Set styles for ttk components

        self.tasks_cache = {}
        self.skills_cache = {}
        self.items_cache = {}

        # 创建 PanedWindow
        self.paned_window = tk.PanedWindow(self.master, orient=tk.HORIZONTAL)
        self.paned_window.pack(fill=tk.BOTH, expand=True)

        # 创建侧边菜单栏
        self.sidebar_frame = tk.Frame(self.paned_window, bg='#2c3e50')
        self.paned_window.add(self.sidebar_frame, width=120)

        self.menu_var = tk.StringVar()
        self.menu_var.set("设置")  # 设置默认选中设置页面

        self.task_button = tk.Radiobutton(self.sidebar_frame, text="主页", variable=self.menu_var, value="任务",
                                          font=FONT, bg='#2c3e50', fg='#ecf0f1', indicatoron=0,
                                          command=self.show_main_task_page, selectcolor="#34495e")
        self.task_button.pack(fill=tk.X, padx=10, pady=10)

        self.settings_button = tk.Radiobutton(self.sidebar_frame, text="设置", variable=self.menu_var, value="设置",
                                              font=FONT, bg='#2c3e50', fg='#ecf0f1', indicatoron=0,
                                              command=self.show_settings_page, selectcolor="#34495e")
        self.settings_button.pack(fill=tk.X, padx=10, pady=10)

        # 创建主内容区
        self.content_frame = tk.Frame(self.paned_window)
        self.paned_window.add(self.content_frame)

        # 初始化页面
        self.create_main_task_page()
        self.create_settings_page()
        self.show_settings_page()  # 首次运行时显示设置页面

        # 读取设置文件
        self.load_settings()

    def set_styles(self):
        style = ttk.Style()
        style.theme_use("clam")

        style.configure("TButton", font=FONT, padding=6, relief="flat",
                        background="#3498db", foreground="#ecf0f1")
        style.map("TButton",
                  background=[("active", "#2980b9")])

        style.configure("TLabel", font=FONT, background="#ecf0f1")

        style.configure("TFrame", background="#ecf0f1")
        style.configure("My.TFrame", background="#ecf0f1", relief="raised", borderwidth=1)

        style.configure("TCombobox", fieldbackground="#ecf0f1", background="#ecf0f1", font=FONT)

    def create_main_task_page(self):
        self.main_task_frame = tk.Frame(self.content_frame, bg='#ecf0f1')
        self.main_task_frame.pack(fill=tk.BOTH, expand=True)

        self.top_frame = tk.Frame(self.main_task_frame, bg='#2c3e50')
        self.top_frame.pack(side=tk.TOP, fill=tk.X)

        self.category_label = tk.Label(self.top_frame, text="选择分类：", font=FONT, bg='#2c3e50', fg='#ecf0f1')
        self.category_label.pack(side=tk.LEFT, padx=10, pady=10)

        self.category_var = tk.StringVar()
        self.category_menu = ttk.Combobox(self.top_frame, textvariable=self.category_var, state='readonly', font=FONT)
        self.category_menu.pack(side=tk.LEFT, padx=10, pady=10)
        self.category_menu.bind("<<ComboboxSelected>>", self.on_category_selected)

        self.add_button = tk.Button(self.top_frame, text="添加任务", font=FONT, command=self.open_add_task_window,
                                    bg='#3498db', fg='#ecf0f1', bd=0, padx=10, pady=5)
        self.add_button.pack(side=tk.RIGHT, padx=10, pady=10)

        self.refresh_button = tk.Button(self.top_frame, text="刷新列表", font=FONT, command=self.refresh_tasks,
                                        bg='#3498db', fg='#ecf0f1', bd=0, padx=10, pady=5)
        self.refresh_button.pack(side=tk.RIGHT, padx=10, pady=10)

        self.task_frame = tk.Frame(self.main_task_frame, bg='#ecf0f1')
        self.task_frame.pack(fill=tk.BOTH, expand=True)

        self.canvas = tk.Canvas(self.task_frame, bg='#ecf0f1')
        self.scrollbar = ttk.Scrollbar(self.task_frame, orient="vertical", command=self.canvas.yview)
        self.scrollable_frame = ttk.Frame(self.canvas, style='My.TFrame')

        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(
                scrollregion=self.canvas.bbox("all")
            )
        )

        self.canvas_window = self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=self.scrollbar.set)

        self.canvas.pack(side="left", fill="both", expand=True)
        self.scrollbar.pack(side="right", fill="y")

        self.master.bind('<Configure>', self.on_resize)
        self.canvas.bind("<Enter>", self._bound_to_mousewheel)
        self.canvas.bind("<Leave>", self._unbound_to_mousewheel)

    def create_settings_page(self):
        self.settings_frame = tk.Frame(self.content_frame, bg='#ecf0f1')

        # 优化布局
        form_frame = tk.Frame(self.settings_frame, bg='#ecf0f1')
        form_frame.pack(pady=20)

        tk.Label(form_frame, text="IP 地址:", font=FONT, bg='#ecf0f1').grid(row=0, column=0, padx=10, pady=10, sticky="e")
        self.ip_entry = tk.Entry(form_frame, font=FONT)
        self.ip_entry.grid(row=0, column=1, padx=10, pady=10)

        tk.Label(form_frame, text="端口:", font=FONT, bg='#ecf0f1').grid(row=1, column=0, padx=10, pady=10, sticky="e")
        self.port_entry = tk.Entry(form_frame, font=FONT)
        self.port_entry.grid(row=1, column=1, padx=10, pady=10)

        save_button = tk.Button(form_frame, text="保存设置", font=FONT, bg='#3498db', fg='#ecf0f1', command=self.save_settings)
        save_button.grid(row=2, columnspan=2, pady=10)

    def show_main_task_page(self):
        self.settings_frame.pack_forget()
        self.main_task_frame.pack(fill=tk.BOTH, expand=True)
        self.load_categories()
        self.load_tasks()
        self.skills_cache = self.fetch_skills()  # 缓存技能数据
        self.items_cache = self.fetch_items(0)  # 缓存商品数据，目录ID为0

    def show_settings_page(self):
        self.main_task_frame.pack_forget()
        self.settings_frame.pack(fill=tk.BOTH, expand=True)

    def save_settings(self):
        ip = self.ip_entry.get().strip()
        port = self.port_entry.get().strip()
        if not ip or not port:
            messagebox.showerror("错误", "IP 地址和端口不能为空")
            return
        global BASE_URL
        BASE_URL = f"http://{ip}:{port}"
        # 保存设置到文件
        with open(SETTINGS_FILE, 'w') as f:
            f.write(f"{ip}:{port}")
        messagebox.showinfo("成功", "设置已保存")

    def load_settings(self):
        if os.path.exists(SETTINGS_FILE):
            with open(SETTINGS_FILE, 'r') as f:
                ip_port = f.read().strip()
                ip, port = ip_port.split(":")
                self.ip_entry.insert(0, ip)
                self.port_entry.insert(0, port)
                global BASE_URL
                BASE_URL = f"http://{ip}:{port}"

    def _bound_to_mousewheel(self, event):
        self.canvas.bind_all("<MouseWheel>", self._on_mousewheel)

    def _unbound_to_mousewheel(self, event):
        self.canvas.unbind_all("<MouseWheel>")

    def _on_mousewheel(self, event):
        if self.canvas.bbox("all")[3] > self.canvas.winfo_height():
            self.canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")

    def on_resize(self, event):
        if (event.widget == self.master):
            new_width = event.width
            self.canvas.itemconfig(self.canvas_window, width=new_width)

    def load_categories(self):
        if not self.is_url_set():
            messagebox.showwarning("警告", "请先在设置中配置 IP 和端口")
            return

        try:
            print("Fetching categories...")
            response = requests.get(f"{BASE_URL}/tasks_categories")
            if response.status_code == 200:
                categories = response.json().get('data', [])
                print(f"Received categories: {categories}")
                category_names = [category['name'] for category in categories]
                self.categories = {category['name']: category['id'] for category in categories}
                self.category_menu['values'] = category_names
                self.category_menu.current(0)  # Set default selection to "全部"
            else:
                messagebox.showerror("错误", "无法获取任务分类")
        except requests.RequestException as e:
            messagebox.showerror("错误", f"请求失败: {e}")

    def on_category_selected(self, event):
        selected_category = self.category_var.get()
        category_id = self.categories.get(selected_category)
        self.load_tasks(category_id)

    def refresh_tasks(self):
        if not self.is_url_set():
            messagebox.showwarning("警告", "请先在设置中配置 IP 和端口")
            return
        self.load_tasks(self.categories.get(self.category_var.get()))

    def load_tasks(self, category_id=None):
        if not self.is_url_set():
            #messagebox.showwarning("警告", "请先在设置中配置 IP 和端口")
            return

        for widget in self.scrollable_frame.winfo_children():
            widget.destroy()

        # Clear the tasks cache
        self.tasks_cache.clear()

        # Fetch tasks from the API
        try:
            if category_id is not None:
                url = f"{BASE_URL}/tasks/{category_id}"
            else:
                url = f"{BASE_URL}/tasks"
            print(f"Fetching tasks from {url}...")
            response = requests.get(url)
            if response.status_code == 200:
                tasks = response.json().get('data', [])
                print(f"Received tasks: {tasks}")
                for task in tasks:
                    self.tasks_cache[task['id']] = task  # Cache the task data
                    self.display_task(task)
                self.scrollable_frame.update_idletasks()  # Update the frame to ensure correct size
                self.canvas.config(scrollregion=self.canvas.bbox("all"))  # Configure the scroll region
            else:
                messagebox.showerror("错误", "无法获取任务列表")
        except requests.RequestException as e:
            messagebox.showerror("错误", f"请求失败: {e}")

    def display_task(self, task):
        print(f"Displaying task: {task['name']}")
        frame = ttk.Frame(self.scrollable_frame, style='My.TFrame', padding=10)
        frame.pack(fill=tk.X, padx=5, pady=1)

        status = tk.IntVar(value=task['status'])
        completed_check = tk.Checkbutton(frame, variable=status,
                                         command=lambda: self.complete_task(task['id'], status.get()),
                                         font=FONT, padx=10, bg='#ecf0f1')
        completed_check.pack(side=tk.LEFT, padx=5, pady=5)

        content_frame = tk.Frame(frame, bg='#ecf0f1')
        content_frame.pack(fill=tk.X, expand=True)
        content_frame.columnconfigure(0, weight=1)

        title = tk.Label(content_frame, text=task['name'], anchor='w', font=TASK_FONT, bg='#ecf0f1', fg='#34495e')
        title.grid(row=0, column=0, sticky="ew", padx=5, pady=5)
        title.bind("<Button-1>", lambda event, task_id=task['id']: self.show_task_details(task_id))

        deadline = tk.Label(content_frame, text=f"截止时间: {self.convert_timestamp(task['deadline'])}", anchor='w',
                            font=FONT, bg='#ecf0f1')
        deadline.grid(row=1, column=0, sticky="w", padx=5)

        print(f"Task '{task['name']}' displayed.")

    def convert_timestamp(self, timestamp):
        print(f"Converting timestamp: {timestamp}")
        if timestamp == 0:
            return "无"
        return datetime.datetime.fromtimestamp(timestamp / 1000).strftime('%Y-%m-%d %H:%M:%S')

    def complete_task(self, task_id, status):
        if status == 1:  # Only complete the task if it's checked
            try:
                encoded_url = urllib.parse.quote(f"lifeup://api/complete?id={task_id}")
                url = f"{BASE_URL}/api/contentprovider?url={encoded_url}"
                print(f"Completing task with URL: {url}")
                response = requests.get(url)
                if response.status_code == 200:
                    result = response.json().get('code', 500)
                    if result == 200:
                        messagebox.showinfo("成功", "任务已完成")
                        self.refresh_tasks()  # Refresh the tasks list
                    else:
                        messagebox.showerror("错误", "无法完成任务")
                else:
                    messagebox.showerror("错误", "无法完成任务")
            except requests.RequestException as e:
                messagebox.showerror("错误", f"请求失败: {e}")
        else:
            messagebox.showinfo("提示", "任务未完成")

    def fetch_skills(self):
        if not self.is_url_set():
            #messagebox.showwarning("警告", "请先在设置中配置 IP 和端口")
            return {}

        try:
            print("Fetching skills...")
            response = requests.get(f"{BASE_URL}/skills")
            if response.status_code == 200:
                skills = response.json().get('data', [])
                skills_cache = {skill['id']: skill['name'] for skill in skills}
                print(f"Skills fetched: {skills_cache}")
                return skills_cache
            else:
                messagebox.showerror("错误", "无法获取技能列表")
                return {}
        except requests.RequestException as e:
            messagebox.showerror("错误", f"请求失败: {e}")
            return {}

    def fetch_items(self, category_id):
        if not self.is_url_set():
            #messagebox.showwarning("警告", "请先在设置中配置 IP 和端口")
            return {}

        try:
            print(f"Fetching items for category ID {category_id}...")
            response = requests.get(f"{BASE_URL}/items/{category_id}")
            if response.status_code == 200:
                items = response.json().get('data', [])
                items_cache = {item['id']: item['name'] for item in items}
                print(f"Items fetched: {items_cache}")
                return items_cache
            else:
                messagebox.showerror("错误", "无法获取商品信息")
                return {}
        except requests.RequestException as e:
            messagebox.showerror("错误", f"请求失败: {e}")
            return {}

    def frequency_to_string(self, frequency):
        if frequency == 0:
            return "单次任务"
        elif frequency == 1:
            return "每日任务"
        elif frequency > 0:
            return f"每 {frequency} 日任务"
        elif frequency == -1:
            return "无限次数"
        elif frequency == -4:
            return "每月任务"
        elif frequency == -5:
            return "每年任务"
        else:
            return "未知频次"

    def show_task_details(self, task_id):
        print(f"Fetching details for task {task_id} from cache")
        task_details = self.tasks_cache.get(task_id)
        if task_details:
            print(f"Received task details from cache: {task_details}")
            self.open_task_detail_window(task_details)
        else:
            messagebox.showerror("错误", "未找到任务详情")

    def open_task_detail_window(self, task_details):
        detail_window = tk.Toplevel(self.master)
        detail_window.title("任务详情")
        detail_window.geometry("600x600")
        self.center_window(detail_window)

        form_frame = tk.Frame(detail_window, bg='#ecf0f1')
        form_frame.pack(padx=10, pady=10, fill=tk.BOTH, expand=True)
        form_frame.columnconfigure(1, weight=1)

        def validate_numeric_input(P):
            if P.isdigit() or P == "":
                return True
            return False

        validate_cmd = form_frame.register(validate_numeric_input)

        tk.Label(form_frame, text="任务名称:", font=FONT, bg='#ecf0f1').grid(row=0, column=0, padx=5, pady=5,
                                                                             sticky="w")
        task_name_entry = tk.Entry(form_frame, font=FONT)
        task_name_entry.grid(row=0, column=1, padx=5, pady=5, sticky="ew")
        task_name_entry.delete(0, "end")
        task_name_entry.insert(0, task_details['name'])

        tk.Label(form_frame, text="任务备注:", font=FONT, bg='#ecf0f1').grid(row=1, column=0, padx=5, pady=5,
                                                                             sticky="w")
        task_notes_entry = tk.Text(form_frame, height=8, font=FONT)
        task_notes_entry.grid(row=1, column=1, padx=5, pady=5, sticky="ew")
        task_notes_entry.insert("1.0", task_details['notes'])

        tk.Label(form_frame, text="金币:", font=FONT, bg='#ecf0f1').grid(row=2, column=0, padx=5, pady=5, sticky="w")
        coin_frame = tk.Frame(form_frame, bg='#ecf0f1')
        coin_frame.grid(row=2, column=1, padx=5, pady=5, sticky="ew")

        # 最小值标签
        tk.Label(coin_frame, text="最小值:", font=FONT, bg='#ecf0f1').grid(row=0, column=0, padx=5, pady=5, sticky="w")
        task_coin_min_spinbox = tk.Spinbox(coin_frame, from_=0, to=1000, validate="key",
                                           validatecommand=(validate_cmd, "%P"), font=FONT, width=10)
        task_coin_min_spinbox.grid(row=0, column=1, padx=5, pady=5)
        task_coin_min_spinbox.delete(0, "end")
        task_coin_min_spinbox.insert(0, task_details['coin'])

        # 最大值标签
        tk.Label(coin_frame, text="最大值:", font=FONT, bg='#ecf0f1').grid(row=0, column=2, padx=5, pady=5, sticky="w")
        task_coin_max_spinbox = tk.Spinbox(coin_frame, from_=0, to=1000, validate="key",
                                           validatecommand=(validate_cmd, "%P"), font=FONT, width=10)
        task_coin_max_spinbox.grid(row=0, column=3, padx=5, pady=5)
        task_coin_max_spinbox.delete(0, "end")
        task_coin_max_spinbox.insert(0, task_details['coin'] + task_details['coinVariable'])

        tk.Label(form_frame, text="经验:", font=FONT, bg='#ecf0f1').grid(row=3, column=0, padx=5, pady=5, sticky="w")
        task_exp_spinbox = tk.Spinbox(form_frame, from_=0, to=1000, validate="key",
                                      validatecommand=(validate_cmd, "%P"), font=FONT, width=47)
        task_exp_spinbox.grid(row=3, column=1, padx=5, pady=5, sticky="ew")
        task_exp_spinbox.delete(0, "end")
        task_exp_spinbox.insert(0, task_details['exp'])

        tk.Label(form_frame, text="技能:", font=FONT, bg='#ecf0f1').grid(row=4, column=0, padx=5, pady=5, sticky="w")
        skill_frame = tk.Frame(form_frame, bg='#ecf0f1')
        skill_frame.grid(row=4, column=1, padx=5, pady=5, sticky="ew")

        skill_vars = {}
        col = 0
        for skill_id, skill_name in self.skills_cache.items():
            var = tk.BooleanVar()
            cb = tk.Checkbutton(skill_frame, text=skill_name, variable=var, font=FONT, bg='#ecf0f1')
            cb.grid(row=0, column=col, padx=1, pady=2, sticky="w")
            skill_vars[skill_id] = var
            skill_frame.columnconfigure(col, weight=1)
            col += 1

        def update_skill_checkbuttons(*args):
            selected_skills = sum(var.get() for var in skill_vars.values())
            for skill_id, var in skill_vars.items():
                if not var.get() and selected_skills >= 3:
                    cb = skill_frame.grid_slaves(row=0, column=list(skill_vars.keys()).index(skill_id))[0]
                    cb.config(state=tk.DISABLED)
                else:
                    cb = skill_frame.grid_slaves(row=0, column=list(skill_vars.keys()).index(skill_id))[0]
                    cb.config(state=tk.NORMAL)

        for var in skill_vars.values():
            var.trace_add("write", update_skill_checkbuttons)

        for skill_id in task_details['skillIds']:
            skill_vars[skill_id].set(True);

        tk.Label(form_frame, text="任务分类:", font=FONT, bg='#ecf0f1').grid(row=5, column=0, padx=5, pady=5,
                                                                             sticky="w")
        task_category_combobox = ttk.Combobox(form_frame, values=[name for name, id_ in self.categories.items() if
                                                                  id_ in [task_details['categoryId']]], font=FONT, state='readonly')
        task_category_combobox.grid(row=5, column=1, padx=5, pady=5, sticky="ew")
        task_category_combobox.current(0)

        tk.Label(form_frame, text="频次:", font=FONT, bg='#ecf0f1').grid(row=6, column=0, padx=5, pady=5, sticky="w")
        frequency_frame = tk.Frame(form_frame, bg='#ecf0f1')
        frequency_frame.grid(row=6, column=1, padx=0, pady=5, sticky="ew")

        frequency_combobox = ttk.Combobox(frequency_frame,
                                          values=["单次任务", "每日任务", "每 N 日任务", "无限次数", "每月任务",
                                                  "每年任务"], font=FONT, state='readonly')
        frequency_combobox.grid(row=0, column=0, padx=5, pady=5)

        n_days_entry = tk.Entry(frequency_frame, font=FONT, width=5)
        n_days_entry.grid(row=0, column=1, padx=5, pady=5)
        n_days_entry.grid_remove()

        # Set the correct frequency value
        if task_details['frequency'] == 0:
            frequency_combobox.set("单次任务")
        elif task_details['frequency'] == 1:
            frequency_combobox.set("每日任务")
        elif task_details['frequency'] > 1:
            frequency_combobox.set("每 N 日任务")
            n_days_entry.grid()
            n_days_entry.insert(0, task_details['frequency'])
        elif task_details['frequency'] == -1:
            frequency_combobox.set("无限次数")
        elif task_details['frequency'] == -4:
            frequency_combobox.set("每月任务")
        elif task_details['frequency'] == -5:
            frequency_combobox.set("每年任务")

        def on_frequency_selected(event):
            if frequency_combobox.get() == "每 N 日任务":
                n_days_entry.grid()
            else:
                n_days_entry.grid_remove()

        frequency_combobox.bind("<<ComboboxSelected>>", on_frequency_selected)

        tk.Label(form_frame, text="商品:", font=FONT, bg='#ecf0f1').grid(row=7, column=0, padx=5, pady=5, sticky="w")
        item_combobox = ttk.Combobox(form_frame, values=list(self.items_cache.values()), font=FONT, state='readonly')
        item_combobox.grid(row=7, column=1, padx=5, pady=5, sticky="ew")

        # Set the correct item value
        item_id = task_details['itemId']
        item_name = self.items_cache.get(item_id, "")
        item_combobox.set(item_name)

        tk.Label(form_frame, text="开始日期:", font=FONT, bg='#ecf0f1').grid(row=8, column=0, padx=5, pady=5,
                                                                             sticky="w")
        task_start_time_entry = tk.Entry(form_frame, font=FONT)
        task_start_time_entry.grid(row=8, column=1, padx=5, pady=5, sticky="ew")
        task_start_time_entry.delete(0, "end")
        task_start_time_entry.insert(0, self.convert_timestamp(task_details['startTime']))

        tk.Label(form_frame, text="截止日期:", font=FONT, bg='#ecf0f1').grid(row=9, column=0, padx=5, pady=5,
                                                                             sticky="w")
        task_deadline_entry = tk.Entry(form_frame, font=FONT)
        task_deadline_entry.grid(row=9, column=1, padx=5, pady=5, sticky="ew")
        task_deadline_entry.delete(0, "end")
        task_deadline_entry.insert(0, self.convert_timestamp(task_details['deadline']))

        tk.Label(form_frame, text="提醒日期:", font=FONT, bg='#ecf0f1').grid(row=10, column=0, padx=5, pady=5,
                                                                             sticky="w")
        task_remind_time_entry = tk.Entry(form_frame, font=FONT)
        task_remind_time_entry.grid(row=10, column=1, padx=5, pady=5, sticky="ew")
        task_remind_time_entry.delete(0, "end")
        task_remind_time_entry.insert(0, self.convert_timestamp(task_details['remindTime']))

    def center_window(self, window):
        window.update_idletasks()
        width = window.winfo_width()
        height = window.winfo_height()
        x = (window.winfo_screenwidth() // 2) - (width // 2)
        y = (window.winfo_screenheight() // 2) - (height // 2)
        window.geometry(f'{width}x{height}+{x}+{y}')

    def open_add_task_window(self):
        if not self.is_url_set():
            messagebox.showwarning("警告", "请先在设置中配置 IP 和端口")
            return

        add_window = tk.Toplevel(self.master)
        add_window.title("添加任务")
        add_window.geometry("600x730")
        self.center_window(add_window)

        form_frame = tk.Frame(add_window, bg='#ecf0f1')
        form_frame.pack(padx=10, pady=10, fill=tk.BOTH, expand=True)
        form_frame.columnconfigure(1, weight=1)

        def validate_numeric_input(P):
            if P.isdigit() or P == "":
                return True
            return False

        validate_cmd = form_frame.register(validate_numeric_input)

        tk.Label(form_frame, text="任务名称:", font=FONT, bg='#ecf0f1').grid(row=0, column=0, padx=5, pady=5,
                                                                             sticky="w")
        task_name_entry = tk.Entry(form_frame, font=FONT)
        task_name_entry.grid(row=0, column=1, padx=5, pady=5, sticky="ew")

        tk.Label(form_frame, text="任务备注:", font=FONT, bg='#ecf0f1').grid(row=1, column=0, padx=5, pady=5,
                                                                             sticky="w")
        task_notes_entry = tk.Text(form_frame, height=4, font=FONT)
        task_notes_entry.grid(row=1, column=1, padx=5, pady=5, sticky="ew")

        tk.Label(form_frame, text="金币:", font=FONT, bg='#ecf0f1').grid(row=2, column=0, padx=5, pady=5, sticky="w")
        coin_frame = tk.Frame(form_frame, bg='#ecf0f1')
        coin_frame.grid(row=2, column=1, padx=5, pady=5, sticky="ew")

        # 最小值标签
        tk.Label(coin_frame, text="最小值:", font=FONT, bg='#ecf0f1').grid(row=0, column=0, padx=5, pady=5, sticky="w")
        task_coin_min_spinbox = tk.Spinbox(coin_frame, from_=0, to=1000, validate="key",
                                           validatecommand=(validate_cmd, "%P"), font=FONT, width=10)
        task_coin_min_spinbox.grid(row=0, column=1, padx=5, pady=5)
        task_coin_min_spinbox.delete(0, "end")
        task_coin_min_spinbox.insert(0, "0")

        # 最大值标签
        tk.Label(coin_frame, text="最大值:", font=FONT, bg='#ecf0f1').grid(row=0, column=2, padx=5, pady=5, sticky="w")
        task_coin_max_spinbox = tk.Spinbox(coin_frame, from_=0, to=1000, validate="key",
                                           validatecommand=(validate_cmd, "%P"), font=FONT, width=10)
        task_coin_max_spinbox.grid(row=0, column=3, padx=5, pady=5)
        task_coin_max_spinbox.delete(0, "end")
        task_coin_max_spinbox.insert(0, "100")

        tk.Label(form_frame, text="经验:", font=FONT, bg='#ecf0f1').grid(row=3, column=0, padx=5, pady=5, sticky="w")
        task_exp_spinbox = tk.Spinbox(form_frame, from_=0, to=1000, validate="key",
                                      validatecommand=(validate_cmd, "%P"), font=FONT, width=47)
        task_exp_spinbox.grid(row=3, column=1, padx=5, pady=5, sticky="ew")
        task_exp_spinbox.delete(0, "end")
        task_exp_spinbox.insert(0, "0")

        tk.Label(form_frame, text="技能:", font=FONT, bg='#ecf0f1').grid(row=4, column=0, padx=5, pady=5, sticky="w")
        skill_frame = tk.Frame(form_frame, bg='#ecf0f1')
        skill_frame.grid(row=4, column=1, padx=5, pady=5, sticky="ew")

        skill_vars = {}
        col = 0
        for skill_id, skill_name in self.skills_cache.items():
            var = tk.BooleanVar()
            cb = tk.Checkbutton(skill_frame, text=skill_name, variable=var, font=FONT, bg='#ecf0f1')
            cb.grid(row=0, column=col, padx=1, pady=2, sticky="w")
            skill_vars[skill_id] = var
            skill_frame.columnconfigure(col, weight=1)
            col += 1

        def update_skill_checkbuttons(*args):
            selected_skills = sum(var.get() for var in skill_vars.values())
            for skill_id, var in skill_vars.items():
                if not var.get() and selected_skills >= 3:
                    cb = skill_frame.grid_slaves(row=0, column=list(skill_vars.keys()).index(skill_id))[0]
                    cb.config(state=tk.DISABLED)
                else:
                    cb = skill_frame.grid_slaves(row=0, column=list(skill_vars.keys()).index(skill_id))[0]
                    cb.config(state=tk.NORMAL)

        for var in skill_vars.values():
            var.trace_add("write", update_skill_checkbuttons)

        tk.Label(form_frame, text="任务分类:", font=FONT, bg='#ecf0f1').grid(row=5, column=0, padx=5, pady=5,
                                                                             sticky="w")
        task_category_combobox = ttk.Combobox(form_frame, values=[name for name, id_ in self.categories.items() if
                                                                  id_ not in [-1, 6]], font=FONT, state='readonly')
        task_category_combobox.grid(row=5, column=1, padx=5, pady=5, sticky="ew")
        task_category_combobox.current(1)

        tk.Label(form_frame, text="频次:", font=FONT, bg='#ecf0f1').grid(row=6, column=0, padx=5, pady=5, sticky="w")
        frequency_frame = tk.Frame(form_frame, bg='#ecf0f1')
        frequency_frame.grid(row=6, column=1, padx=0, pady=5, sticky="ew")

        frequency_combobox = ttk.Combobox(frequency_frame,
                                          values=["单次任务", "每日任务", "每 N 日任务", "无限次数", "每月任务",
                                                  "每年任务"], font=FONT, state='readonly')
        frequency_combobox.grid(row=0, column=0, padx=5, pady=5)
        frequency_combobox.current(0)

        n_days_entry = tk.Entry(frequency_frame, font=FONT, width=5)
        n_days_entry.grid(row=0, column=1, padx=5, pady=5)
        n_days_entry.grid_remove()

        def on_frequency_selected(event):
            if frequency_combobox.get() == "每 N 日任务":
                n_days_entry.grid()
            else:
                n_days_entry.grid_remove()

        frequency_combobox.bind("<<ComboboxSelected>>", on_frequency_selected)

        tk.Label(form_frame, text="重要程度:", font=FONT, bg='#ecf0f1').grid(row=7, column=0, padx=5, pady=5,
                                                                             sticky="w")
        importance_combobox = ttk.Combobox(form_frame, values=["LV1", "LV2", "LV3", "LV4"], font=FONT, state='readonly')
        importance_combobox.grid(row=7, column=1, padx=5, pady=5, sticky="ew")
        importance_combobox.current(0)

        tk.Label(form_frame, text="困难程度:", font=FONT, bg='#ecf0f1').grid(row=8, column=0, padx=5, pady=5,
                                                                             sticky="w")
        difficulty_combobox = ttk.Combobox(form_frame, values=["LV1", "LV2", "LV3", "LV4"], font=FONT, state='readonly')
        difficulty_combobox.grid(row=8, column=1, padx=5, pady=5, sticky="ew")
        difficulty_combobox.current(0)

        tk.Label(form_frame, text="商品:", font=FONT, bg='#ecf0f1').grid(row=9, column=0, padx=5, pady=5, sticky="w")
        item_combobox = ttk.Combobox(form_frame, values=list(self.items_cache.values()), font=FONT, state='readonly')
        item_combobox.grid(row=9, column=1, padx=5, pady=5, sticky="ew")
        item_combobox.current(1)

        tk.Label(form_frame, text="商品数量:", font=FONT, bg='#ecf0f1').grid(row=10, column=0, padx=5, pady=5,
                                                                             sticky="w")
        item_amount_spinbox = tk.Spinbox(form_frame, from_=0, to=1000, validate="key",
                                         validatecommand=(validate_cmd, "%P"), font=FONT, width=47)
        item_amount_spinbox.grid(row=10, column=1, padx=5, pady=5, sticky="ew")
        item_amount_spinbox.delete(0, "end")
        item_amount_spinbox.insert(0, "1")

        tk.Label(form_frame, text="截止日期:", font=FONT, bg='#ecf0f1').grid(row=11, column=0, padx=5, pady=5,
                                                                             sticky="w")
        deadline_entry = Calendar(form_frame, selectmode="day", date_pattern="yyyy-mm-dd", background="#3498db",
                                  foreground="white", selectbackground="#2980b9", font=FONT)
        deadline_entry.grid(row=11, column=1, padx=5, pady=5, sticky="ew")

        tk.Label(form_frame, text="感想:", font=FONT, bg='#ecf0f1').grid(row=12, column=0, padx=5, pady=5, sticky="w")
        task_feelings_var = tk.BooleanVar()
        task_feelings_check = tk.Checkbutton(form_frame, variable=task_feelings_var, font=FONT, bg='#ecf0f1')
        task_feelings_check.grid(row=12, column=1, padx=5, pady=5, sticky="w")

        def calculate_exp():
            importance = int(importance_combobox.get().replace("LV", ""))
            difficulty = int(difficulty_combobox.get().replace("LV", ""))
            skill_count = sum(var.get() for var in skill_vars.values())

            if skill_count == 0:
                task_exp_spinbox.delete(0, "end")
                task_exp_spinbox.insert(0, "0")
                return

            if skill_count == 1:
                exp = importance * 65 + difficulty * 65
            elif skill_count == 2:
                exp = importance * 65 + difficulty * 65 - (difficulty * 30 if importance > difficulty else
                                                           max(importance, difficulty) * 30)
            elif skill_count == 3:
                exp = importance * 65 + difficulty * 65 - (difficulty * 40 if importance > difficulty else
                                                           max(importance, difficulty) * 40)

            task_exp_spinbox.delete(0, "end")
            task_exp_spinbox.insert(0, str(exp))

        # 绑定事件
        for var in skill_vars.values():
            var.trace_add("write", lambda *args: calculate_exp())
        importance_combobox.bind("<<ComboboxSelected>>", lambda event: calculate_exp())
        difficulty_combobox.bind("<<ComboboxSelected>>", lambda event: calculate_exp())

        def add_task():
            skills_selected = [skill_id for skill_id, var in skill_vars.items() if var.get()]
            if len(skills_selected) > 3:
                messagebox.showerror("错误", "最多选择3个技能")
                return

            # 获取并设置deadline为选中日期的23:59:59
            selected_date = datetime.datetime.strptime(deadline_entry.get_date(), "%Y-%m-%d")
            deadline = datetime.datetime.combine(selected_date, datetime.time(23, 59, 59))
            timestamp_deadline = int(deadline.timestamp() * 1000)

            task_data = {
                "todo": task_name_entry.get().strip(),
                "notes": task_notes_entry.get("1.0", tk.END).strip(),
                "coin": task_coin_min_spinbox.get().strip(),
                "coin_var": int(task_coin_max_spinbox.get()) - int(task_coin_min_spinbox.get()),
                "exp": task_exp_spinbox.get().strip(),
                "category": self.categories.get(task_category_combobox.get()),
                "frequency": n_days_entry.get() if frequency_combobox.get() == "每 N 日任务" else {"单次任务": 0,
                                                                                                   "每日任务": 1,
                                                                                                   "无限次数": -1,
                                                                                                   "每月任务": -4,
                                                                                                   "每年任务": -5}.get(
                    frequency_combobox.get(), 0),
                "importance": importance_combobox.get().replace("LV", ""),
                "difficulty": difficulty_combobox.get().replace("LV", ""),
                "item_id": list(self.items_cache.keys())[
                    list(self.items_cache.values()).index(item_combobox.get())] if item_combobox.get() else "",
                "item_amount": item_amount_spinbox.get().strip(),
                "deadline": timestamp_deadline,
                "write_feelings": str(task_feelings_var.get()).lower()
            }

            # 校验表单数据
            if task_data["todo"] == "":
                messagebox.showerror("错误", "任务名称不能为空")
                return
            if task_data["coin"] == "":
                messagebox.showerror("错误", "金币最小值不能为空")
                return
            if task_coin_max_spinbox.get().strip() == "":
                messagebox.showerror("错误", "金币最大值不能为空")
                return
            if task_data["exp"] == "":
                messagebox.showerror("错误", "经验不能为空")
                return
            if task_data["item_amount"] == "":
                messagebox.showerror("错误", "商品数量不能为空")
                return

            # 将技能转换成列表并单独处理
            skills_list = [("skills", skill) for skill in skills_selected]
            encoded_task_data = urllib.parse.urlencode(task_data) + '&' + urllib.parse.urlencode(skills_list,
                                                                                                 doseq=True)
            encoded_url = urllib.parse.quote(f"lifeup://api/add_task?{encoded_task_data}")
            url = f"{BASE_URL}/api/contentprovider?url={encoded_url}"

            try:
                print(f"Adding task with URL: {url}")
                response = requests.get(url)
                if response.status_code == 200:
                    result = response.json().get('code', 500)
                    if result == 200:
                        messagebox.showinfo("成功", "任务已添加")
                        add_window.destroy()
                        self.refresh_tasks()
                    else:
                        messagebox.showerror("错误", "无法添加任务")
                else:
                    messagebox.showerror("错误", "无法添加任务")
            except requests.RequestException as e:
                messagebox.showerror("错误", f"请求失败: {e}")

        add_task_button = tk.Button(form_frame, text="添加任务", command=add_task, font=FONT, bg='#3498db',
                                    fg='#ecf0f1', bd=0, padx=10, pady=0)
        add_task_button.grid(row=13, column=1, padx=5, pady=0, sticky="e")


    def is_url_set(self):
        return bool(self.ip_entry.get() and self.port_entry.get())

    def set_base_url(self):
        global BASE_URL
        ip = self.ip_entry.get().strip()
        port = self.port_entry.get().strip()
        if ip and port:
            BASE_URL = f"http://{ip}:{port}"
            self.load_tasks()
        else:
            messagebox.showwarning("警告", "IP 或端口为空")


if __name__ == "__main__":
    root = tk.Tk()
    app = TaskManagerApp(root)
    root.mainloop()
