# SAQR Backend API README

This document is the backend contract required by the SAQR frontend.

The frontend integration layer is `assets/js/core-services.js`. It calls the backend only when an API base URL is configured. Without that setting, it uses localStorage demo data.

## Base URL

Recommended base path:

```text
https://your-domain.com/api/v1
```

Frontend configuration:

```html
<script>
  window.SAQR_API_BASE_URL = "https://your-domain.com/api/v1";
</script>
<script src="../assets/js/core-services.js"></script>
```

Alternative for local testing in the browser console:

```js
localStorage.setItem("saqr_api_base_url", "http://localhost:3000/api/v1");
```

## Response Shape

The frontend accepts either a raw JSON object/array or a wrapped response:

```json
{
  "data": {}
}
```

Errors should return an HTTP error status and:

```json
{
  "message": "Human readable error message"
}
```

## Authentication

### POST `/auth/login`

Purpose: authenticate admin, lecturer, or student.

Request:

```json
{
  "email": "student@saqr.edu",
  "password": "password123"
}
```

Success `200`:

```json
{
  "token": "jwt-token-or-session-token",
  "user": {
    "id": "3",
    "username": "student",
    "email": "student@saqr.edu",
    "role": "student",
    "status": "active",
    "createdAt": "2026-06-24T00:00:00.000Z"
  }
}
```

Failure `401`:

```json
{
  "message": "Invalid email or password."
}
```

## Users

### User Model

```json
{
  "id": "1",
  "username": "admin",
  "email": "admin@saqr.edu",
  "role": "admin",
  "status": "active",
  "createdAt": "2026-06-24T00:00:00.000Z"
}
```

Valid roles:

```text
admin
lecturer
student
```

### GET `/users`

Purpose: list users.

Optional query:

```text
?role=student
?role=lecturer
?role=admin
```

Success `200`:

```json
[
  {
    "id": "3",
    "username": "student",
    "email": "student@saqr.edu",
    "role": "student",
    "status": "active",
    "createdAt": "2026-06-24T00:00:00.000Z"
  }
]
```

### POST `/users`

Purpose: create a user from registration or admin create-user page.

Request:

```json
{
  "username": "newstudent",
  "email": "newstudent@saqr.edu",
  "password": "password123",
  "role": "student"
}
```

Success `201`:

```json
{
  "id": "u_100",
  "username": "newstudent",
  "email": "newstudent@saqr.edu",
  "role": "student",
  "status": "active",
  "createdAt": "2026-06-24T00:00:00.000Z"
}
```

Failure `409`:

```json
{
  "message": "A user with this email already exists."
}
```

### DELETE `/users/{id}`

Purpose: delete a student or lecturer from admin management pages.

Success:

```text
204 No Content
```

## Subjects

### Subject Model

```json
{
  "id": "s1",
  "code": "ASE-401",
  "name": "Advanced Software Engineering",
  "credits": "12",
  "department": "Computer Science",
  "assignedLecturer": "lecturer",
  "status": "active",
  "createdAt": "2026-06-24T00:00:00.000Z"
}
```

Important: `assignedLecturer` must match the lecturer `username`, because the current frontend filters lecturer tasks/subjects by username.

### GET `/subjects`

Purpose: list all subjects for admin, lecturer, and student views.

Success `200`:

```json
[
  {
    "id": "s1",
    "code": "ASE-401",
    "name": "Advanced Software Engineering",
    "credits": "12",
    "department": "Computer Science",
    "assignedLecturer": "lecturer",
    "status": "active",
    "createdAt": "2026-06-24T00:00:00.000Z"
  }
]
```

### POST `/subjects`

Purpose: create/assign a subject from the admin manage-subject page.

Request:

```json
{
  "code": "DBMS-202",
  "name": "Database Management Systems",
  "credits": "12",
  "department": "Information Technology",
  "assignedLecturer": "lecturer"
}
```

Success `201`: return the created subject.

### DELETE `/subjects/{id}`

Purpose: remove a subject from the admin manage-subject page.

Success:

```text
204 No Content
```

## Tasks

### Task Model

```json
{
  "id": "TSK_1",
  "title": "Assignment 1",
  "type": "Assignment",
  "subject": "ASE-401",
  "instructions": "Upload your solution.",
  "dueDate": "2026-07-01T23:59",
  "priority": "Normal",
  "targetStudent": "All Students",
  "createdBy": "lecturer",
  "status": "pending",
  "createdAt": "2026-06-24T00:00:00.000Z"
}
```

Valid task types:

```text
Assignment
Quiz
```

Important: `createdBy` must match the lecturer `username`.

### GET `/tasks`

Purpose: list tasks for lecturer management and student task dashboards.

Success `200`:

```json
[
  {
    "id": "TSK_1",
    "title": "Assignment 1",
    "type": "Assignment",
    "subject": "ASE-401",
    "instructions": "Upload your solution.",
    "dueDate": "2026-07-01T23:59",
    "priority": "Normal",
    "targetStudent": "All Students",
    "createdBy": "lecturer",
    "status": "pending",
    "createdAt": "2026-06-24T00:00:00.000Z"
  }
]
```

### POST `/tasks`

Purpose: lecturer creates a quiz or assignment.

Request:

```json
{
  "title": "Quiz 1",
  "type": "Quiz",
  "subject": "ASE-401",
  "instructions": "Complete all questions.",
  "dueDate": "2026-07-01T10:00",
  "priority": "30 Mins",
  "targetStudent": "All Students",
  "createdBy": "lecturer"
}
```

Success `201`: return the created task.

### DELETE `/tasks/{id}`

Purpose: lecturer deletes a task.

Success:

```text
204 No Content
```

## Recommended Backend Implementation Notes

- Enable CORS for the frontend origin during local development.
- Accept `Authorization: Bearer <token>` on authenticated routes.
- Store passwords hashed, never plaintext.
- Return stable `id` values as strings.
- Return ISO date strings for `createdAt` and `dueDate`.
- Keep role values lowercase.
- Keep task `type` values title case: `Assignment` or `Quiz`.

