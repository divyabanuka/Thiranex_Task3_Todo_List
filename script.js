// Get elements from HTML
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");
const taskCount = document.getElementById("taskCount");
const clearCompletedBtn = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".filter-btn");

// Load saved tasks from localStorage
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let currentFilter = "all";

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Display tasks
function renderTasks() {
    taskList.innerHTML = "";

    let filteredTasks = tasks;

    if (currentFilter === "active") {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === "completed") {
        filteredTasks = tasks.filter(task => task.completed);
    }

    if (filteredTasks.length === 0) {
        emptyMessage.style.display = "block";
    } else {
        emptyMessage.style.display = "none";
    }

    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";

        if (task.completed) {
            li.classList.add("completed");
        }

        li.innerHTML = `
            <input 
                type="checkbox" 
                class="complete-checkbox"
                data-id="${task.id}"
                ${task.completed ? "checked" : ""}
            >

            <span class="task-text">${escapeHTML(task.text)}</span>

            <div class="task-actions">
                <button class="edit-btn" data-id="${task.id}">
                    Edit
                </button>

                <button class="delete-btn" data-id="${task.id}">
                    Delete
                </button>
            </div>
        `;

        taskList.appendChild(li);
    });

    updateTaskCount();
}

// Add new task
function addTask() {
    const text = taskInput.value.trim();

    if (text === "") {
        alert("Please enter a task.");
        return;
    }

    const newTask = {
        id: Date.now(),
        text: text,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();

    taskInput.value = "";
    taskInput.focus();
}

// Update task count
function updateTaskCount() {
    const activeTasks = tasks.filter(task => !task.completed).length;

    if (activeTasks === 1) {
        taskCount.textContent = "1 task remaining";
    } else {
        taskCount.textContent = `${activeTasks} tasks remaining`;
    }
}

// Complete / uncomplete task
function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveTasks();
    renderTasks();
}

// Edit task
function editTask(id) {
    const task = tasks.find(task => task.id === id);

    if (!task) return;

    const updatedText = prompt("Edit your task:", task.text);

    if (updatedText === null) {
        return;
    }

    const trimmedText = updatedText.trim();

    if (trimmedText === "") {
        alert("Task cannot be empty.");
        return;
    }

    task.text = trimmedText;

    saveTasks();
    renderTasks();
}

// Delete task
function deleteTask(id) {
    const confirmDelete = confirm("Are you sure you want to delete this task?");

    if (!confirmDelete) {
        return;
    }

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderTasks();
}

// Clear completed tasks
function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);

    saveTasks();
    renderTasks();
}

// Filter tasks
function setFilter(filter) {
    currentFilter = filter;

    filterButtons.forEach(button => {
        button.classList.remove("active");

        if (button.dataset.filter === filter) {
            button.classList.add("active");
        }
    });

    renderTasks();
}

// Event: Add task button
addTaskBtn.addEventListener("click", addTask);

// Event: Enter key
taskInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        addTask();
    }
});

// Event delegation for task buttons
taskList.addEventListener("click", function(event) {

    const id = Number(event.target.dataset.id);

    if (event.target.classList.contains("delete-btn")) {
        deleteTask(id);
    }

    if (event.target.classList.contains("edit-btn")) {
        editTask(id);
    }
});

// Event delegation for checkbox
taskList.addEventListener("change", function(event) {

    if (event.target.classList.contains("complete-checkbox")) {
        const id = Number(event.target.dataset.id);

        toggleTask(id);
    }
});

// Filter buttons
filterButtons.forEach(button => {
    button.addEventListener("click", function() {
        setFilter(button.dataset.filter);
    });
});

// Clear completed button
clearCompletedBtn.addEventListener("click", clearCompleted);

// Prevent HTML injection
function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// Initial display
renderTasks();