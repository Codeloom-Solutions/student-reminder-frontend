document.addEventListener("DOMContentLoaded", () => {
    // 1. Verify Session & Ensure Current User is a Lecturer
    const sessionUser = JSON.parse(localStorage.getItem('saqr_session'));
    if (!sessionUser || sessionUser.role.toLowerCase() !== "lecturer") return;

    // Standardize username to lowercase to guarantee exact data matches
    const lecturerUser = sessionUser.username.toLowerCase();
    const pathname = window.location.pathname;

    // Core Global Data Repositories
    const allSubjects = (JSON.parse(localStorage.getItem('saqr_subjects')) || []).map(Contract.subject);
    const allTasks = (JSON.parse(localStorage.getItem('saqr_tasks')) || []).map(Contract.task);
    const allUsers = (JSON.parse(localStorage.getItem('saqr_users')) || []).map(Contract.user);

    // Filter data belonging strictly to this logged-in lecturer
    const mySubjects = allSubjects.filter(s => String(s.assignedLecturer || "").toLowerCase() === lecturerUser);
    const myTasks = allTasks.filter(t => String(t.createdBy || "").toLowerCase() === lecturerUser);
    const studentsList = allUsers.filter(u => u.role === "student");

    // ====================================================================
    // FEATURE A: LECTURER DASHBOARD WORKSPACE (Calculations & Cards)
    // ====================================================================
    if (pathname.includes("dashboard")) {
        const totalSubjectsCount = mySubjects.length;
        const totalAssignmentsCount = myTasks.filter(t => t.type.toLowerCase() === "assignment").length;
        const totalQuizzesCount = myTasks.filter(t => t.type.toLowerCase() === "quiz").length;

        // Smart Self-Adjusting Counter Card Linker
        const populateCounterCard = (cardTextKeyword, countValue) => {
            const labelElement = Array.from(document.querySelectorAll('*')).find(el => {
                const text = el.textContent.trim().toLowerCase();
                return text === cardTextKeyword && el.children.length === 0;
            });

            if (labelElement) {
                const parentCard = labelElement.parentElement;
                const pillSlot = parentCard.querySelector('div:last-child, p, span, .pill');
                if (pillSlot) {
                    pillSlot.innerHTML = countValue;
                    pillSlot.style.display = "flex";
                    pillSlot.style.justifyContent = "center";
                    pillSlot.style.alignItems = "center";
                    pillSlot.style.fontSize = "2.2rem";
                    pillSlot.style.fontWeight = "bold";
                    pillSlot.style.color = "white";
                }
            }
        };

        populateCounterCard("total subjects", totalSubjectsCount);
        populateCounterCard("total assignments", totalAssignmentsCount);
        populateCounterCard("total quizzes", totalQuizzesCount);

        // --- 2. Populate Recent Activity Box Safely ---
        const dashboardHeadings = Array.from(document.querySelectorAll('h3'));
        const recentActivityHeading = dashboardHeadings.find(el => el.textContent.trim().toLowerCase() === "recent activities");
        
        if (recentActivityHeading) {
            const cardBody = recentActivityHeading.parentElement;
            let innerContent = cardBody.querySelector('.saqr-dynamic-wrapper');
            if (!innerContent) {
                innerContent = document.createElement('div');
                innerContent.className = 'saqr-dynamic-wrapper';
                innerContent.style.marginTop = '15px';
                cardBody.appendChild(innerContent);
            }

            if (myTasks.length === 0) {
                innerContent.innerHTML = `<p style="color:#64748b; font-size:0.9rem; margin:0;">No tasks deployed yet.</p>`;
            } else {
                const recentItemsHTML = myTasks.slice(-4).reverse().map(task => `
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding: 8px 0; font-size:0.85rem;">
                        <div>
                            <strong style="color:#041E42;">[${task.type.toUpperCase()}]</strong> ${task.title}
                            <div style="color:#64748b; font-size:0.75rem;">Subject: ${task.subject} | Target: ${task.targetStudent}</div>
                        </div>
                        <span style="color:#64748b; font-size:0.8rem;">${task.dueDate}</span>
                    </div>
                `).join('');
                innerContent.innerHTML = `<div style="display:flex; flex-direction:column; gap:8px;">${recentItemsHTML}</div>`;
            }
        }

        // --- 3. Populate Notifications Box Safely ---
        const notificationsHeading = dashboardHeadings.find(el => el.textContent.trim().toLowerCase() === "notifications");
        if (notificationsHeading) {
            const cardBody = notificationsHeading.parentElement;
            let innerContent = cardBody.querySelector('.saqr-dynamic-wrapper');
            if (!innerContent) {
                innerContent = document.createElement('div');
                innerContent.className = 'saqr-dynamic-wrapper';
                innerContent.style.marginTop = '15px';
                cardBody.appendChild(innerContent);
            }

            innerContent.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:10px; font-size:0.85rem;">
                    <div style="background:#f8fafc; border-left:4px solid #3b82f6; padding:10px; border-radius:4px; text-align: left;">
                        <span style="font-weight:600; color:#1e293b; display:block; margin-bottom:4px;">System Track Confirmation</span>
                        <p style="margin:0; color:#475569;">You are currently managing <strong>${totalSubjectsCount}</strong> assigned academic course tracks.</p>
                    </div>
                </div>`;
        }
    }

    if (pathname.includes("create")) return;

    // ====================================================================
    // FEATURE B: DYNAMIC TASK CREATION HANDLER
    // ====================================================================
    if (pathname.includes("create")) {
        const selectDropdowns = document.querySelectorAll('select');
        const selectStyle = "width:100%; padding:10px; margin-top:5px; margin-bottom:15px; border:1px solid #cbd5e1; border-radius:6px; background:white; font-size:0.9rem;";

        selectDropdowns.forEach((dropdown) => {
            if (dropdown.textContent.includes("No subjects assigned") || dropdown.options.length <= 1) {
                dropdown.innerHTML = mySubjects.length === 0 
                    ? `<option value="">No subjects assigned to you yet</option>`
                    : mySubjects.map(s => `<option value="${s.code}">${s.code} - ${s.name}</option>`).join('');
                
                if (!dropdown.parentElement.parentElement.querySelector('.saqr-student-target')) {
                    const studentGroupWrapper = document.createElement('div');
                    studentGroupWrapper.innerHTML = `
                        <label style="font-weight: 600; font-size: 0.85rem; color:#1e293b; display:block; margin-top:10px;">TARGET ASSIGNED STUDENT</label>
                        <select class="saqr-student-target" style="${selectStyle}">
                            <option value="All Students">All Enrolled Students</option>
                            ${studentsList.map(st => `<option value="${st.username}">${st.username}</option>`).join('')}
                        </select>
                    `;
                    dropdown.parentElement.insertAdjacentElement('afterend', studentGroupWrapper);
                }
            }
        });

        const quizBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.toLowerCase().includes("quiz"));
        const assignmentBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.toLowerCase().includes("assignment"));

        if (quizBtn) {
            quizBtn.addEventListener("click", (e) => {
                e.preventDefault();
                const container = quizBtn.closest('div').parentElement;
                const titleInp = container.querySelector('input[type="text"]');
                const subjSel = container.querySelector('select');
                const studentSel = container.querySelector('.saqr-student-target');
                const dateInp = container.querySelector('input[type="date"], input[type="datetime-local"]');
                const durationInp = container.querySelector('input[type="number"]');

                if (!titleInp.value || !subjSel.value || !dateInp.value) {
                    alert("Please fill out all required configuration fields before deployment.");
                    return;
                }

                allTasks.push({
                    id: "TSK_" + Date.now(),
                    title: titleInp.value,
                    type: "Quiz",
                    subject: subjSel.value,
                    targetStudent: studentSel.value,
                    dueDate: dateInp.value,
                    metaValue: durationInp ? durationInp.value + " Mins" : "N/A",
                    creator: lecturerUser
                });

                localStorage.setItem('saqr_tasks', JSON.stringify(allTasks));
                alert("Quiz parameter data matrix deployed successfully!");
                window.location.reload();
            });
        }

        if (assignmentBtn) {
            assignmentBtn.addEventListener("click", (e) => {
                e.preventDefault();
                const container = assignmentBtn.closest('div').parentElement;
                const titleInp = container.querySelector('input[type="text"]');
                const selectors = container.querySelectorAll('select');
                const subjSel = selectors[0];
                const studentSel = container.querySelector('.saqr-student-target');
                const prioritySel = selectors[1]; 
                const dateInp = container.querySelector('input[type="date"], input[type="datetime-local"]');

                if (!titleInp.value || !subjSel.value || !dateInp.value) {
                    alert("Please fill out all required configuration fields before deployment.");
                    return;
                }

                allTasks.push({
                    id: "TSK_" + Date.now(),
                    title: titleInp.value,
                    type: "Assignment",
                    subject: subjSel.value,
                    targetStudent: studentSel.value,
                    dueDate: dateInp.value,
                    metaValue: prioritySel ? prioritySel.value : "Normal",
                    creator: lecturerUser
                });

                localStorage.setItem('saqr_tasks', JSON.stringify(allTasks));
                alert("Assignment record data matrix initialized successfully!");
                window.location.reload();
            });
        }
    }

    // ====================================================================
    // FEATURE C: MANAGE TASK INTERFACE (Custom Div Component Target Fix)
    // ====================================================================
    if (pathname.includes("manage")) {
        const listContainer = document.getElementById('tasks-list-target');
        if (listContainer) {
            listContainer.innerHTML = ""; 

            if (myTasks.length === 0) {
                listContainer.innerHTML = `<div style="text-align:center; padding:25px; color:#64748b;">No deployed tasks available to show.</div>`;
            } else {
                myTasks.forEach((task) => {
                    const isQuiz = task.type.toLowerCase() === 'quiz';
                    const badgeStyle = `background: ${isQuiz ? '#eff6ff' : '#ecfdf5'}; color: ${isQuiz ? '#3b82f6' : '#10b981'}; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; display: inline-block;`;
                    
                    // Construct a custom data row wrapper that mirrors your data-list-header layout rules
                    const rowItem = document.createElement('div');
                    rowItem.className = "data-list-row"; // CSS Grid class handles layout automatically now

                    rowItem.innerHTML = `
                        <div style="color:#1e293b; font-weight:600;">${task.title}</div>
                        <div><span style="${badgeStyle}">${task.type}</span></div>
                        <div style="color:#475569;">${task.subject}</div>
                        <div style="color:#475569;">${task.dueDate}</div>
                        <div>
                            <button class="saqr-delete-task-btn" data-id="${task.id}" style="background:#ef4444; color:white; border:none; padding:6px 14px; border-radius:4px; cursor:pointer; font-size:0.8rem; font-weight:600; transition: 0.2s;">
                                Delete
                            </button>
                        </div>
                    `;
                    listContainer.appendChild(rowItem);
                });

                // Clear task items securely by filtering them out of storage via unique structural key ID mapping
                listContainer.querySelectorAll('.saqr-delete-task-btn').forEach(btn => {
                    btn.addEventListener("click", () => {
                        if (confirm("Are you certain you wish to purge this deployment task track record?")) {
                            const taskId = btn.getAttribute('data-id');
                            const updatedTasks = allTasks.filter(t => t.id !== taskId);
                            localStorage.setItem('saqr_tasks', JSON.stringify(updatedTasks));
                            alert("Task tracking record dropped successfully.");
                            window.location.reload();
                        }
                    });
                });
            }
        }
    }

    // ====================================================================
    // FEATURE D: LECTURER NOTIFICATION TOGGLES
    // ====================================================================
    if (pathname.includes("notification")) {
        const toggleCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        const lecturerKey = `saqr_toggles_lecturer_${lecturerUser}`;
        const savedState = JSON.parse(localStorage.getItem(lecturerKey)) || { email: true, sms: false };

        if (toggleCheckboxes.length >= 2) {
            toggleCheckboxes[0].checked = savedState.email;
            toggleCheckboxes[1].checked = savedState.sms;

            toggleCheckboxes.forEach((checkbox) => {
                checkbox.addEventListener("change", () => {
                    const currentToggles = {
                        email: toggleCheckboxes[0].checked,
                        sms: toggleCheckboxes[1].checked
                    };
                    localStorage.setItem(lecturerKey, JSON.stringify(currentToggles));
                });
            });
        }
    }
});
