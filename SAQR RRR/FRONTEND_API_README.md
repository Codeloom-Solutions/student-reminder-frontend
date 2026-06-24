# SAQR Frontend API Integration README

The frontend API integration is centralized in:

```text
assets/js/core-services.js
```

Do not call `fetch()` directly from page handlers. Use these services:

```js
AuthService.login(email, password)
AuthService.getSession()
AuthService.logout()

DataService.createUser(userData)
DataService.getUsersByRole(role)
DataService.deleteUser(id)

DataService.getSubjects()
DataService.createSubject(subjectData)
DataService.deleteSubject(id)

DataService.getTasks()
DataService.createTask(taskData)
DataService.deleteTask(id)
DataService.getAllSystemDataRecords()
```

## Connect To A Backend

Add this before loading `core-services.js` on each page:

```html
<script>
  window.SAQR_API_BASE_URL = "http://localhost:3000/api/v1";
</script>
<script src="../assets/js/core-services.js"></script>
```

Or set it once in the browser console:

```js
localStorage.setItem("saqr_api_base_url", "http://localhost:3000/api/v1");
location.reload();
```

To go back to local demo mode:

```js
localStorage.removeItem("saqr_api_base_url");
location.reload();
```

## Local Demo Credentials

When no API base URL is configured, localStorage mock mode seeds:

```text
Admin: admin@saqr.edu / password123
Lecturer: lecturer@saqr.edu / password123
Student: student@saqr.edu / password123
```

## Frontend Data Rules

The frontend normalizes old data shapes, but new backend data should use these fields.

User:

```js
{
  id: "3",
  username: "student",
  email: "student@saqr.edu",
  role: "student",
  status: "active",
  createdAt: "2026-06-24T00:00:00.000Z"
}
```

Subject:

```js
{
  id: "s1",
  code: "ASE-401",
  name: "Advanced Software Engineering",
  credits: "12",
  department: "Computer Science",
  assignedLecturer: "lecturer",
  status: "active",
  createdAt: "2026-06-24T00:00:00.000Z"
}
```

Task:

```js
{
  id: "TSK_1",
  title: "Assignment 1",
  type: "Assignment",
  subject: "ASE-401",
  instructions: "Upload your solution.",
  dueDate: "2026-07-01T23:59",
  priority: "Normal",
  targetStudent: "All Students",
  createdBy: "lecturer",
  status: "pending",
  createdAt: "2026-06-24T00:00:00.000Z"
}
```

## Existing Page Integration

- Login page uses `AuthService.login()`.
- Register page uses `DataService.createUser()`.
- Admin create-user/manage-students/manage-lecturers pages use user endpoints.
- Admin manage-subject page uses subject endpoints.
- Lecturer create-task/manage-task pages use task endpoints.
- Student tasks/courses/dashboard pages read task and subject endpoints.
- Export pages read `DataService.getAllSystemDataRecords()`.





