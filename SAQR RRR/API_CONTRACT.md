# SAQR Student Reminder Frontend API Contract

This frontend now uses `assets/js/core-services.js` as the single integration layer. It works immediately with localStorage mock data, and it can call a backend when `window.SAQR_API_BASE_URL` is set before `core-services.js`, or when `localStorage.saqr_api_base_url` is set.

Example:

```html
<script>
  window.SAQR_API_BASE_URL = "https://api.example.com/api/v1";
</script>
<script src="../assets/js/core-services.js"></script>
```

## Authentication

### POST `/auth/login`

Request:

```json
{
  "email": "student@saqr.edu",
  "password": "password123"
}
```

Response:

```json
{
  "token": "jwt-or-session-token",
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

Errors:

```json
{ "message": "Invalid email or password." }
```

## Users

User object:

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

Allowed roles: `admin`, `lecturer`, `student`.

### GET `/users?role=student`

Returns:

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

Request:

```json
{
  "username": "newstudent",
  "email": "newstudent@saqr.edu",
  "password": "password123",
  "role": "student"
}
```

Returns the created user object.

### DELETE `/users/{id}`

Returns `204 No Content` or:

```json
{ "success": true }
```

## Subjects

Subject object:

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

### GET `/subjects`

Returns an array of subject objects.

### POST `/subjects`

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

Returns the created subject object.

### DELETE `/subjects/{id}`

Returns `204 No Content` or:

```json
{ "success": true }
```

## Tasks

Task object:

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

Allowed task types: `Assignment`, `Quiz`.

### GET `/tasks`

Returns an array of task objects.

### POST `/tasks`

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

Returns the created task object.

### DELETE `/tasks/{id}`

Returns `204 No Content` or:

```json
{ "success": true }
```

## Frontend Local Mock Credentials

When no API base URL is configured, the frontend seeds local demo accounts:

- Admin: `admin@saqr.edu` / `password123`
- Lecturer: `lecturer@saqr.edu` / `password123`
- Student: `student@saqr.edu` / `password123`
