const taskInput = document.getElementById("taskInput");
    const addButton = document.getElementById("addButton");
    const taskList = document.getElementById("taskList");
    const dueDateInput = document.getElementById("dueDate");
    const prioritySelect = document.getElementById("priority");
    const darkModeToggle = document.getElementById("darkModeToggle");
    const searchInput = document.getElementById("searchInput");
    const priorityFilter = document.getElementById("priorityFilter");
    const sortBy = document.getElementById("sortBy");
    const taskStats = document.getElementById("taskStats");

    let tasks = JSON.parse(localStorage.getItem("notebookTasks")) || [];

    function saveTasks() {
      localStorage.setItem("notebookTasks", JSON.stringify(tasks));
    }

    function renderTasks(searchText = "", selectedPriority = "All") {
      taskList.innerHTML = "";
      let completedCount = 0;

      let filteredTasks = tasks.filter((task) => {
        const matchesSearch = task.text.toLowerCase().includes(searchText.toLowerCase());
        const matchesPriority = selectedPriority === "All" || task.priority === selectedPriority;
        return matchesSearch && matchesPriority;
      });

      if (sortBy.value === "dueDate") {
        filteredTasks.sort((a, b) => new Date(a.dueDate || "9999-12-31") - new Date(b.dueDate || "9999-12-31"));
      } else if (sortBy.value === "priority") {
        const priorityOrder = { High: 1, Medium: 2, Low: 3 };
        filteredTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      }

      filteredTasks.forEach((task, displayIndex) => {
        const index = tasks.indexOf(task);

        const li = document.createElement("li");
        li.dataset.index = index;

        const number = document.createElement("div");
        number.className = "line-number";
        number.textContent = displayIndex + 1;

        const taskText = document.createElement("span");
        taskText.className = "task-text";
        if (task.completed) {
          taskText.classList.add("completed");
          completedCount++;
        }
        taskText.textContent = task.text;

        const due = document.createElement("span");
        due.className = "due";
        if (task.dueDate) due.textContent = `Due: ${task.dueDate}`;

        const priority = document.createElement("span");
        priority.className = "priority";
        priority.textContent = `Priority: ${task.priority}`;

        const buttons = document.createElement("div");
        buttons.className = "buttons";

        const editBtn = document.createElement("button");
        editBtn.className = "btn edit";
        editBtn.textContent = "✏️";

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn delete";
        deleteBtn.textContent = "❌";

        buttons.appendChild(editBtn);
        buttons.appendChild(deleteBtn);

        li.appendChild(number);
        li.appendChild(taskText);
        li.appendChild(priority);
        li.appendChild(due);
        li.appendChild(buttons);
        taskList.appendChild(li);
      });

      taskStats.textContent = `Completed: ${completedCount} / ${tasks.length}`;
    }

    function editTask(index) {
      const li = [...taskList.children].find(li => li.dataset.index == index);
      const taskTextEl = li.querySelector(".task-text");
      const originalText = tasks[index].text;

      const input = document.createElement("input");
      input.type = "text";
      input.value = originalText;
      input.className = "edit-input";

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          tasks[index].text = input.value.trim() || originalText;
          saveTasks();
          renderTasks(searchInput.value, priorityFilter.value);
        } else if (e.key === "Escape") {
          renderTasks(searchInput.value, priorityFilter.value);
        }
      });

      taskTextEl.replaceWith(input);
      input.focus();
    }

    addButton.addEventListener("click", () => {
      const text = taskInput.value.trim();
      const dueDate = dueDateInput.value;
      const priority = prioritySelect.value;
      if (text !== "") {
        tasks.push({ text, dueDate, priority, completed: false });
        taskInput.value = "";
        dueDateInput.value = "";
        saveTasks();
        renderTasks(searchInput.value, priorityFilter.value);
      }
    });

    taskList.addEventListener("click", (e) => {
      const index = e.target.closest("li").dataset.index;
      if (e.target.classList.contains("delete")) {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks(searchInput.value, priorityFilter.value);
      } else if (e.target.classList.contains("edit")) {
        editTask(index);
      } else if (e.target.classList.contains("task-text")) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks(searchInput.value, priorityFilter.value);
      }
    });

    searchInput.addEventListener("input", () => {
      renderTasks(searchInput.value, priorityFilter.value);
    });

    priorityFilter.addEventListener("change", () => {
      renderTasks(searchInput.value, priorityFilter.value);
    });

    sortBy.addEventListener("change", () => {
      renderTasks(searchInput.value, priorityFilter.value);
    });

    darkModeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
    });

    renderTasks();