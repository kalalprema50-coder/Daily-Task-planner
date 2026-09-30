// ==========================================
// DAILY TASK PLANNER 2
// ==========================================

// HTML elements
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskTime = document.getElementById("taskTime");
const taskPriority = document.getElementById("taskPriority");

const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");
const errorMessage = document.getElementById("errorMessage");

const currentDate = document.getElementById("currentDate");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");

const progressPercent = document.getElementById("progressPercent");
const progressBar = document.getElementById("progressBar");

const taskCount = document.getElementById("taskCount");

const searchInput = document.getElementById("searchInput");

const filterButtons = document.querySelectorAll(".filter-btn");


// ==========================================
// TASK DATA
// ==========================================

let tasks = JSON.parse(
    localStorage.getItem("dailyTaskPlanner")
) || [];

let currentFilter = "all";


// ==========================================
// CURRENT DATE
// ==========================================

function showCurrentDate() {

    const today = new Date();

    const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    };

    currentDate.textContent =
        today.toLocaleDateString("en-IN", options);
}

showCurrentDate();


// ==========================================
// SAVE TASKS
// ==========================================

function saveTasks() {

    localStorage.setItem(
        "dailyTaskPlanner",
        JSON.stringify(tasks)
    );
}


// ==========================================
// ADD TASK
// ==========================================

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const taskName = taskInput.value.trim();

    if (taskName === "") {

        errorMessage.textContent =
            "Please enter a task.";

        taskInput.focus();

        return;
    }


    const newTask = {

        id: Date.now().toString(),

        name: taskName,

        time: taskTime.value,

        priority: taskPriority.value,

        completed: false

    };


    tasks.push(newTask);

    saveTasks();


    taskInput.value = "";
    taskTime.value = "";
    taskPriority.value = "Medium";

    errorMessage.textContent = "";

    displayTasks();

    taskInput.focus();

});


// ==========================================
// DISPLAY TASKS
// ==========================================

function displayTasks() {

    taskList.innerHTML = "";

    const searchText =
        searchInput.value.toLowerCase().trim();


    const filteredTasks = tasks.filter(function(task) {

        const matchesSearch =
            task.name.toLowerCase().includes(searchText);


        let matchesFilter = true;


        if (currentFilter === "pending") {

            matchesFilter =
                task.completed === false;

        }


        if (currentFilter === "completed") {

            matchesFilter =
                task.completed === true;

        }


        return matchesSearch && matchesFilter;

    });


    if (filteredTasks.length === 0) {

        emptyMessage.style.display = "block";

    } else {

        emptyMessage.style.display = "none";

    }


    filteredTasks.forEach(function(task) {

        createTaskElement(task);

    });


    updateStatistics();

}


// ==========================================
// CREATE TASK CARD
// ==========================================

function createTaskElement(task) {

    const taskCard = document.createElement("div");

    taskCard.className = "task-card";

    // IMPORTANT:
    // Store the task ID directly on the card.
    // This makes Edit/Delete work correctly.
    taskCard.dataset.id = task.id;


    if (task.completed) {

        taskCard.classList.add("completed");

    }


    const priorityClass =
        task.priority.toLowerCase();


    const timeText =
        task.time ? task.time : "No time set";


    taskCard.innerHTML = `

        <div class="task-content">

            <div class="task-check">

                <input
                    type="checkbox"
                    class="task-checkbox"
                    ${task.completed ? "checked" : ""}
                >

            </div>


            <div class="task-information">

                <h3 class="task-name">
                    ${escapeHTML(task.name)}
                </h3>

                <div class="task-meta">

                    <span class="task-time">
                        ⏰ ${escapeHTML(timeText)}
                    </span>

                    <span class="priority ${priorityClass}">
                        ${escapeHTML(task.priority)}
                    </span>

                </div>

            </div>

        </div>


        <div class="task-actions">

            <button
                type="button"
                class="edit-btn"
                title="Edit Task">
                ✏️ Edit
            </button>

            <button
                type="button"
                class="delete-btn"
                title="Delete Task">
                🗑️ Delete
            </button>

        </div>

    `;


    // ======================================
    // CHECKBOX
    // ======================================

    const checkbox =
        taskCard.querySelector(".task-checkbox");


    checkbox.addEventListener("change", function() {

        toggleTask(task.id);

    });


    // ======================================
    // EDIT BUTTON
    // ======================================

    const editButton =
        taskCard.querySelector(".edit-btn");


    editButton.addEventListener("click", function() {

        editTask(task.id);

    });


    // ======================================
    // DELETE BUTTON
    // ======================================

    const deleteButton =
        taskCard.querySelector(".delete-btn");


    deleteButton.addEventListener("click", function() {

        deleteTask(task.id);

    });


    taskList.appendChild(taskCard);

}


// ==========================================
// EDIT TASK
// ==========================================

function editTask(id) {

    const task = tasks.find(function(item) {

        return String(item.id) === String(id);

    });


    if (!task) {
        return;
    }


    // Find card using ID instead of task name
    const taskCard =
        taskList.querySelector(
            `[data-id="${CSS.escape(String(id))}"]`
        );


    if (!taskCard) {
        return;
    }


    taskCard.innerHTML = `

        <div class="edit-area">

            <input
                type="text"
                class="edit-input"
                value="${escapeAttribute(task.name)}"
            >

            <input
                type="time"
                class="edit-time"
                value="${escapeAttribute(task.time || "")}"
            >

            <select class="edit-priority">

                <option value="High"
                    ${task.priority === "High" ? "selected" : ""}>
                    High
                </option>

                <option value="Medium"
                    ${task.priority === "Medium" ? "selected" : ""}>
                    Medium
                </option>

                <option value="Low"
                    ${task.priority === "Low" ? "selected" : ""}>
                    Low
                </option>

            </select>


            <div class="edit-buttons">

                <button
                    type="button"
                    class="save-btn">
                    💾 Save
                </button>

                <button
                    type="button"
                    class="cancel-btn">
                    ❌ Cancel
                </button>

            </div>

        </div>

    `;


    const editInput =
        taskCard.querySelector(".edit-input");

    const editTime =
        taskCard.querySelector(".edit-time");

    const editPriority =
        taskCard.querySelector(".edit-priority");


    // ======================================
    // SAVE EDIT
    // ======================================

    const saveButton =
        taskCard.querySelector(".save-btn");


    saveButton.addEventListener("click", function() {

        const newName =
            editInput.value.trim();


        if (newName === "") {

            alert("Task name cannot be empty.");

            editInput.focus();

            return;

        }


        task.name = newName;

        task.time = editTime.value;

        task.priority =
            editPriority.value;


        saveTasks();

        displayTasks();

    });


    // ======================================
    // CANCEL EDIT
    // ======================================

    const cancelButton =
        taskCard.querySelector(".cancel-btn");


    cancelButton.addEventListener("click", function() {

        displayTasks();

    });


    // Focus input
    editInput.focus();

}


// ==========================================
// COMPLETE / PENDING
// ==========================================

function toggleTask(id) {

    const task = tasks.find(function(item) {

        return String(item.id) === String(id);

    });


    if (!task) {
        return;
    }


    task.completed =
        !task.completed;


    saveTasks();

    displayTasks();

}


// ==========================================
// DELETE TASK
// ==========================================

function deleteTask(id) {

    const confirmDelete =
        confirm("Are you sure you want to delete this task?");


    if (!confirmDelete) {
        return;
    }


    tasks = tasks.filter(function(task) {

        return String(task.id) !== String(id);

    });


    saveTasks();

    displayTasks();

}


// ==========================================
// FILTER BUTTONS
// ==========================================

filterButtons.forEach(function(button) {

    button.addEventListener("click", function() {


        filterButtons.forEach(function(btn) {

            btn.classList.remove("active");

        });


        button.classList.add("active");


        currentFilter =
            button.dataset.filter;


        displayTasks();

    });

});


// ==========================================
// SEARCH
// ==========================================

searchInput.addEventListener("input", function() {

    displayTasks();

});


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(function(task) {

            return task.completed;

        }).length;


    const pending =
        total - completed;


    totalTasks.textContent =
        total;

    pendingTasks.textContent =
        pending;

    completedTasks.textContent =
        completed;


    if (total === 1) {

        taskCount.textContent =
            "1 task";

    } else {

        taskCount.textContent =
            total + " tasks";

    }


    let percentage = 0;


    if (total > 0) {

        percentage =
            Math.round(
                (completed / total) * 100
            );

    }


    progressPercent.textContent =
        percentage + "%";


    progressBar.style.width =
        percentage + "%";


    progressBar.setAttribute(
        "aria-valuenow",
        percentage
    );

}


// ==========================================
// HTML SECURITY
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


function escapeAttribute(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}


// ==========================================
// INITIAL LOAD
// ==========================================

displayTasks();