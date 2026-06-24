document.addEventListener("DOMContentLoaded", async () => {
    const forms = document.querySelectorAll("form");
    const session = AuthService.getSession();
    
    if (!session || session.role !== "lecturer") return;

    // Get all subjects assigned to this logged-in lecturer
    const allSubjects = JSON.parse(localStorage.getItem('saqr_subjects')) || [];
    const assignedSubjects = allSubjects.filter(sub => sub.assignedLecturer === session.username);

    // Dynamically update form dropdown menus inside create-task.html
    const subjectDropdowns = document.querySelectorAll('select[name="quiz-subject"], select[name="assignment-subject"], select');
    subjectDropdowns.forEach(dropdown => {
        dropdown.innerHTML = ""; // Clear static layout entries
        if (assignedSubjects.length === 0) {
            const option = document.createElement("option");
            option.textContent = "No subjects assigned to you yet";
            dropdown.appendChild(option);
        } else {
            assignedSubjects.forEach(sub => {
                const option = document.createElement("option");
                option.value = sub.name;
                option.textContent = `${sub.code} - ${sub.name}`;
                dropdown.appendChild(option);
            });
        }
    });

    // Form submission processing
    forms.forEach(form => {
        const headline = form.querySelector("h2") ? form.querySelector("h2").textContent.toLowerCase() : "";
        
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (assignedSubjects.length === 0) {
                alert("Action Blocked: You do not have an assigned course curriculum to create tasks under.");
                return;
            }

            let taskPayload = {};
            const subjectSelect = form.querySelector('select');

            if (headline.includes("quiz")) {
                taskPayload = {
                    type: "Quiz",
                    subject: subjectSelect ? subjectSelect.value : assignedSubjects[0].name,
                    title: form.querySelector('[name="quiz-title"]').value,
                    instructions: form.querySelector('[name="quiz-instructions"]').value,
                    dueDate: form.querySelector('[name="quiz-duedate"]').value,
                    createdBy: session.username
                };
            } else {
                taskPayload = {
                    type: "Assignment",
                    subject: subjectSelect ? subjectSelect.value : assignedSubjects[0].name,
                    title: form.querySelector('[name="assignment-title"]').value,
                    description: form.querySelector('[name="assignment-description"]').value,
                    dueDate: form.querySelector('[name="assignment-duedate"]').value,
                    createdBy: session.username
                };
            }

            // Create evaluation task record
            await DataService.createTask(taskPayload);
            
            // Write log metric to system engine and dispatch updates to students
            SystemLogEngine.write(`Faculty member [${session.username}] deployed a new evaluation assignment/quiz metrics block`, "INFO");
            NotificationEngine.dispatch("student", "all", `New academic eval update posted: "${taskPayload.title}" added to curriculum list.`);

            alert(`${taskPayload.type} assigned successfully! It is now visible on student task screens.`);
            form.reset();
        });
    });
});