document.addEventListener("DOMContentLoaded", () => {

console.log("SAQR Student Dashboard Engine Active...");



// 1. Fetch data arrays from LocalStorage safely

const tasks = JSON.parse(localStorage.getItem('saqr_tasks')) || [];

const subjects = JSON.parse(localStorage.getItem('saqr_subjects')) || [];



// 2. Compute Metrics

const totalTasksCount = tasks.length;

const assignmentCount = tasks.filter(t => {

const type = String(t.type || '').toUpperCase();

return type === "ASSIGNMENT" || type.includes("ASSIGN");

}).length;



const quizCount = tasks.filter(t => {

const type = String(t.type || '').toUpperCase();

return type === "QUIZ" || type.includes("QUIZ");

}).length;



const now = new Date();

const overdueCount = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now).length;



// ==========================================

// PART A: SURGICALLY UPDATE METRIC CARDS

// ==========================================

const metricLabels = ["Total Tasks", "Upcoming Assignments", "Upcoming Quizzes", "Overdue Work"];


// Find text elements matching the labels without wiping out card containers

const textElements = Array.from(document.querySelectorAll('div, p, h1, h2, h3, h4'));


metricLabels.forEach(label => {

const matchingEl = textElements.find(el => el.textContent.trim() === label && el.children.length === 0);


if (matchingEl && matchingEl.parentElement) {

const cardContainer = matchingEl.parentElement;


// Check if value element already exists to avoid duplication loops

let valueDisplay = cardContainer.querySelector('.saqr-dynamic-value');

if (!valueDisplay) {

valueDisplay = document.createElement('div');

valueDisplay.className = 'saqr-dynamic-value';

valueDisplay.style.cssText = "font-size: 2.2rem; font-weight: 800; color: #041E42; margin-top: 10px; text-align: center;";

cardContainer.appendChild(valueDisplay);

}


// Route the accurate quantitative counts

if (label === "Total Tasks") valueDisplay.textContent = totalTasksCount;

else if (label === "Upcoming Assignments") valueDisplay.textContent = assignmentCount;

else if (label === "Upcoming Quizzes") valueDisplay.textContent = quizCount;

else if (label === "Overdue Work") valueDisplay.textContent = overdueCount;

}

});



// ==========================================

// PART B: SURGICALLY POPULATE RECENT NOTIFICATIONS

// ==========================================

const notificationHeading = Array.from(document.querySelectorAll('h1, h2, h3, h4, div, strong'))

.find(el => el.textContent.trim().startsWith("Recent Notification:") && el.children.length === 0);



if (notificationHeading && notificationHeading.parentElement) {

const parentBox = notificationHeading.parentElement;



// Strip out previous layout placeholders, but retain the primary heading element

Array.from(parentBox.children).forEach(child => {

if (child !== notificationHeading) child.remove();

});



if (tasks.length === 0) {

const emptyState = document.createElement('div');

emptyState.style.cssText = "background:#f8fafc; padding:15px; border-radius:6px; color:#64748b; font-size:0.9rem; border:1px solid #e2e8f0; margin-top:12px;";

emptyState.textContent = "No new system notifications deployment.";

parentBox.appendChild(emptyState);

} else {

// Take the last two items added to local storage

tasks.slice(-2).reverse().forEach(task => {

const notificationItem = document.createElement('div');

notificationItem.style.cssText = "background: white; border-left: 4px solid #3b82f6; padding: 12px 15px; margin-top: 10px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); text-align: left;";

notificationItem.innerHTML = `

<strong style="color:#1e293b; font-size:0.95rem;">New ${task.type || 'Task'} Released:</strong> ${task.title || task.name || 'Untitled'}

<div style="font-size:0.8rem; color:#64748b; margin-top:4px;">Module Code Target: ${task.subject || 'General'}</div>

`;

parentBox.appendChild(notificationItem);

});

}

}



// ==========================================

// PART C: SURGICALLY POPULATE PENDING ASSIGNMENTS

// ==========================================

const assignmentsHeading = Array.from(document.querySelectorAll('h1, h2, h3, h4, div, strong'))

.find(el => el.textContent.trim().startsWith("Pending Assignments:") && el.children.length === 0);



if (assignmentsHeading && assignmentsHeading.parentElement) {

const parentBox = assignmentsHeading.parentElement;



// Clear out only non-heading child elements

Array.from(parentBox.children).forEach(child => {

if (child !== assignmentsHeading) child.remove();

});



const ongoingTasks = tasks.filter(t => !t.dueDate || new Date(t.dueDate) >= now);



if (ongoingTasks.length === 0) {

const emptyState = document.createElement('div');

emptyState.style.cssText = "background:#f8fafc; padding:15px; border-radius:6px; color:#64748b; font-size:0.9rem; border:1px solid #e2e8f0; margin-top:12px;";

emptyState.textContent = "Clean slate! No pending assessments due.";

parentBox.appendChild(emptyState);

} else {

ongoingTasks.forEach(task => {

const dateString = task.dueDate ? new Date(task.dueDate).toLocaleString() : "No Deadline Set";

const assignmentItem = document.createElement('div');

assignmentItem.style.cssText = "background: white; border: 1px solid #e2e8f0; padding: 12px 15px; margin-top: 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; text-align: left;";

assignmentItem.innerHTML = `

<div>

<span style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:4px; font-size:0.75rem; font-weight:bold; text-transform:uppercase; margin-right:8px;">${task.type || 'TASK'}</span>

<strong style="color:#041E42;">${task.title || task.name || 'Untitled Assessment'}</strong>

<div style="font-size:0.8rem; color:#64748b; margin-top:2px;">Module Code: ${task.subject || 'N/A'}</div>

</div>

<div style="text-align: right; font-size: 0.85rem; color: #475569;">

<span style="display:block; font-weight:600;">Due Date:</span>

<span>${dateString}</span>

</div>

`;

parentBox.appendChild(assignmentItem);

});

}

}

});



document.addEventListener("DOMContentLoaded", () => {

console.log("SAQR Dashboard Metric Engine Initializing...");



// 1. Fetch data

const tasks = JSON.parse(localStorage.getItem('saqr_tasks')) || [];

const subjects = JSON.parse(localStorage.getItem('saqr_subjects')) || [];



// 2. Perform Calculations

const totalTasks = tasks.length;


// Use .toLowerCase() to ensure matching works regardless of Admin input case

const totalAssignments = tasks.filter(t =>

String(t.type || '').toLowerCase() === 'assignment'

).length;



const totalQuizzes = tasks.filter(t =>

String(t.type || '').toLowerCase() === 'quiz'

).length;



const totalSubjects = subjects.length;



// 3. Update the UI using your exact ID matches

const updateMetric = (id, value) => {

const el = document.getElementById(id);

if (el) {

el.textContent = value;

el.style.fontSize = "2rem"; // Ensure it's readable

el.style.fontWeight = "bold";

} else {

console.warn(`Metric element not found: ${id}`);

}

};



updateMetric('metric-total-tasks', totalTasks);

updateMetric('metric-total-assignments', totalAssignments);

updateMetric('metric-total-quizzes', totalQuizzes);

updateMetric('metric-total-subjects', totalSubjects);



console.log("Dashboard Updated:", { totalTasks, totalAssignments, totalQuizzes, totalSubjects });

}); 

