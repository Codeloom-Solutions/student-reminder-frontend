document.addEventListener("DOMContentLoaded", async () => {
    const pathname = window.location.pathname;
    const taskTableBody = document.getElementById("tasks-table-body");
    const taskContainer = document.querySelector(".data-list-wrapper") || document.querySelector(".workspace");
    const passwordForm = document.querySelector("form");

    if (pathname.includes("tasks.html")) {
        const tasks = await DataService.getTasks();
        const renderStatus = (task) => {
            const due = task.dueDate ? new Date(task.dueDate) : null;
            if (due && due < new Date()) return `<span style="color:#ef4444; font-weight:700;">Overdue</span>`;
            return `<span style="color:#f59e0b; font-weight:700;">Pending Submit</span>`;
        };

        if (taskTableBody) {
            taskTableBody.innerHTML = tasks.length === 0
                ? `<tr><td colspan="5" style="padding:30px; text-align:center; color:#64748b;">No evaluations or assignment milestones currently deployed for your class stream.</td></tr>`
                : tasks.map(task => `
                    <tr>
                        <td>${task.title}</td>
                        <td>${task.subject}</td>
                        <td>${task.dueDate ? new Date(task.dueDate).toLocaleString() : "No due date"}</td>
                        <td>${task.priority || "Normal"}</td>
                        <td>${renderStatus(task)}</td>
                    </tr>
                `).join("");
        } else if (taskContainer) {
            const headerRow = taskContainer.querySelector(".data-list-header");
            const headerHTML = headerRow ? headerRow.outerHTML : `
                <div class="data-list-header" style="display:grid; grid-template-columns:2fr 1fr 1.5fr 1fr; padding:12px 20px; font-weight:bold; background:#e2e8f0;">
                    <div>Task Assignment Title</div><div>Course Subject</div><div>Due Date Frame</div><div>Status Option</div>
                </div>`;

            const rows = tasks.length === 0
                ? `<div style="padding:30px; text-align:center; color:#64748b;">No evaluations or assignment milestones currently deployed for your class stream.</div>`
                : tasks.map(task => `
                    <div class="data-list-row" style="display:grid; grid-template-columns:2fr 1fr 1.5fr 1fr; padding:16px 20px; border-bottom:1px solid #f1f5f9; align-items:center;">
                        <div><strong>${task.title}</strong> <span style="font-size:0.75rem; background:#041E42; color:#fff; padding:2px 6px; border-radius:4px; margin-left:6px;">${task.type}</span></div>
                        <div>${task.subject}</div>
                        <div>${task.dueDate ? new Date(task.dueDate).toLocaleString() : "No due date"}</div>
                        <div>${renderStatus(task)}</div>
                    </div>`).join("");

            taskContainer.innerHTML = headerHTML + rows;
        }
    }

    if (taskContainer && pathname.includes("courses.html")) {
        const subjects = await DataService.getSubjects();
        const headerRow = taskContainer.querySelector(".data-list-header");
        const headerHTML = headerRow ? headerRow.outerHTML : "";

        const courseRowsHTML = subjects.length === 0
            ? `<div style="padding:30px; text-align:center; color:#64748b;">No academic modules have been deployed by administration yet.</div>`
            : subjects.map(course => `
                <div class="data-list-row" style="display:grid; grid-template-columns:2fr 1.5fr 1.5fr 1fr; padding:16px 20px; border-bottom:1px solid #f1f5f9;">
                    <div><strong>${course.name}</strong></div>
                    <div>Code Reference: ${course.code}</div>
                    <div>${course.assignedLecturer || course.department}</div>
                    <div style="color:#10b981; font-weight:bold;">Registered</div>
                </div>`).join("");

        taskContainer.innerHTML = headerHTML + courseRowsHTML;
    }

    if (passwordForm && pathname.includes("change-password")) {
        passwordForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const inputs = passwordForm.querySelectorAll('input[type="password"]');
            const session = AuthService.getSession();

            if (inputs.length >= 2) {
                const newPassword = inputs[0].value;
                const confirmPassword = inputs[1].value;

                if (!newPassword || !confirmPassword) {
                    alert("Please fill out all password fields.");
                    return;
                }

                if (newPassword !== confirmPassword) {
                    alert("Password fields do not match.");
                    return;
                }

                const users = MockDB.getItems("saqr_users").map(user => user.id === session?.id ? { ...user, password: newPassword } : user);
                MockDB.setItem("saqr_users", users);
                SystemLogEngine.write(`Password changed by student account: ${session?.username || "unknown"}`, "SECURITY");
                alert("Password updated successfully.");
                passwordForm.reset();
            }
        });
    }
});
