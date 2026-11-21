
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskPriority = document.getElementById("task-priority");

const totalTasks = document.getElementById("total-tasks");
const completedTasks = document.getElementById("completed-tasks");
const pendingTasks = document.getElementById("pending-tasks");
let currentFilter = "all";
let currentPriorityFilter = "all";

const priorityFilterButtons = document.querySelectorAll(
  "#priority-filter-buttons button"
);
const searchInput = document.getElementById("search-input");
const emptyMessage = document.createElement("p");
const filterButtons = document.querySelectorAll("#filter-buttons button");

emptyMessage.textContent = "No tasks yet. Add your first task!";
taskList.appendChild(emptyMessage);

function updateEmptyMessage() {
  const allTasks = taskList.querySelectorAll("li");

  emptyMessage.style.display = allTasks.length === 0 ? "block" : "none";
}

function updateTaskStats() {
  const allTasks = taskList.querySelectorAll("li");
  const completed = taskList.querySelectorAll('input[type="checkbox"]:checked');

  totalTasks.textContent = allTasks.length;
  completedTasks.textContent = completed.length;
  pendingTasks.textContent = allTasks.length - completed.length;

  updateEmptyMessage();
}

function saveTasks() {
  const allTasks = taskList.querySelectorAll("li");
  const tasks = [];

  allTasks.forEach(function (li) {
    const taskText = li.querySelector(".task-text");
    const checkbox = li.querySelector('input[type="checkbox"]');

    tasks.push({
      text: taskText.textContent,
      completed: checkbox.checked,
      priority: li.dataset.priority
    });
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function createTaskElement(task) {
  const li = document.createElement("li");

  const priority = ["high", "medium", "low"].includes(task.priority)
    ? task.priority
    : "medium";

  li.dataset.priority = priority;

  const taskText = document.createElement("span");
  taskText.className = "task-text";
  taskText.textContent = task.text;

  const priorityBadge = document.createElement("span");
  priorityBadge.className = `priority-badge ${priority}`;
  priorityBadge.textContent = priority.charAt(0).toUpperCase() + priority.slice(1);

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = Boolean(task.completed);

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";

  if (checkbox.checked) {
    taskText.style.textDecoration = "line-through";
  }

  deleteBtn.addEventListener("click", function () {
    li.remove();

    updateTaskStats();
    applyTaskView();
    saveTasks();
  });

  editBtn.addEventListener("click", function () {
    const newValue = prompt("Enter updated task:", taskText.textContent);

    if (newValue !== null && newValue.trim() !== "") {
      taskText.textContent = newValue.trim();

      applyTaskView();
      saveTasks();
    }
  });

  checkbox.addEventListener("change", function () {
    taskText.style.textDecoration = checkbox.checked ? "line-through" : "none";

    updateTaskStats();
    applyTaskView();
    saveTasks();
  });

  li.appendChild(taskText);
  li.appendChild(priorityBadge);
  li.appendChild(checkbox);
  li.appendChild(editBtn);
  li.appendChild(deleteBtn);

  return li;
}

function loadTasks() {
  let savedTasks = [];

  try {
    savedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  } catch (error) {
    savedTasks = [];
  }

  if (!Array.isArray(savedTasks)) {
    savedTasks = [];
  }

  savedTasks.forEach(function (task) {
    if (task && typeof task.text === "string") {
      const li = createTaskElement(task);
      taskList.appendChild(li);
    }
  });

  updateTaskStats();
  applyTaskView();
}
filterButtons.forEach(function (button) {
  button.classList.toggle(
    "active",
    button.dataset.filter === currentFilter
  );
});

priorityFilterButtons.forEach(function (button) {
  button.classList.toggle(
    "active",
    button.dataset.priority === currentPriorityFilter
  );
});
taskForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const taskValue = taskInput.value.trim();

  if (taskValue === "") {
    return;
  }

  const li = createTaskElement({
    text: taskValue,
    completed: false,
    priority: taskPriority.value
  });

  taskList.appendChild(li);

  taskInput.value = "";
  taskPriority.value = "medium";

  updateTaskStats();
  applyTaskView();
  saveTasks();
});

loadTasks();

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    currentFilter = button.dataset.filter;

    filterButtons.forEach(function (btn) {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    applyTaskView();
  });
});
priorityFilterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    currentPriorityFilter = button.dataset.priority;

    priorityFilterButtons.forEach(function (btn) {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    applyTaskView();
  });
});
searchInput.addEventListener("input", function () {
  applyTaskView();
});

function applyTaskView() {
  const allTasks = taskList.querySelectorAll("li");
  const searchValue = searchInput.value.trim().toLowerCase();

  allTasks.forEach(function (li) {
    const taskText = li.querySelector(".task-text").textContent.toLowerCase();
    const checkbox = li.querySelector('input[type="checkbox"]');

    const matchesSearch = taskText.includes(searchValue);

    const matchesFilter =
      currentFilter === "all" ||
      (currentFilter === "completed" && checkbox.checked) ||
      (currentFilter === "pending" && !checkbox.checked);

    const matchesPriority =
      currentPriorityFilter === "all" ||
      li.dataset.priority === currentPriorityFilter;

    li.style.display =
      matchesSearch && matchesFilter && matchesPriority ? "flex" : "none";
  });
}