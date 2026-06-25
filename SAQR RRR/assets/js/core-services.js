// =========================================================================
// SAQR Portal API Client + Local Mock Fallback
// =========================================================================
const SAQR_CONFIG = {
    apiBaseUrl: localStorage.getItem("saqr_api_base_url") || window.SAQR_API_BASE_URL || "",
    useRemoteApi: Boolean(localStorage.getItem("saqr_api_base_url") || window.SAQR_API_BASE_URL)
};

const Contract = {
    user(user) {
        return {
            id: String(user.id || crypto.randomUUID?.() || Date.now()),
            username: String(user.username || user.name || "").trim(),
            email: String(user.email || "").trim().toLowerCase(),
            password: user.password || "password123",
            role: String(user.role || "student").toLowerCase(),
            status: user.status || "active",
            createdAt: user.createdAt || new Date().toISOString()
        };
    },
    subject(subject) {
        return {
            id: String(subject.id || crypto.randomUUID?.() || Date.now()),
            code: String(subject.code || subject.subjectCode || "").trim(),
            name: String(subject.name || subject.subjectName || subject.description || "").trim(),
            credits: String(subject.credits || subject.credit || "0").trim(),
            department: subject.department || "Academic Branch",
            assignedLecturer: String(subject.assignedLecturer || subject.lecturer || subject.lecturerAssignment || "").trim(),
            status: subject.status || "active",
            createdAt: subject.createdAt || new Date().toISOString()
        };
    },
    task(task) {
        return {
            id: String(task.id || crypto.randomUUID?.() || Date.now()),
            title: String(task.title || task.name || "").trim(),
            type: String(task.type || "Assignment").trim(),
            subject: String(task.subject || task.subjectCode || "").trim(),
            instructions: task.instructions || task.description || "",
            dueDate: task.dueDate || task.deadline || "",
            priority: task.priority || task.metaValue || "Normal",
            targetStudent: task.targetStudent || "All Students",
            createdBy: task.createdBy || task.creator || "",
            status: task.status || "pending",
            createdAt: task.createdAt || new Date().toISOString()
        };
    }
};

const MockDB = {
    init() {
        if (!localStorage.getItem("saqr_users")) {
            this.setItem("saqr_users", [
                { id: "1", username: "admin", email: "admin@saqr.edu", password: "password123", role: "admin" },
                { id: "2", username: "lecturer", email: "lecturer@saqr.edu", password: "password123", role: "lecturer" },
                { id: "3", username: "student", email: "student@saqr.edu", password: "password123", role: "student" }
            ].map(Contract.user));
        }
        if (!localStorage.getItem("saqr_subjects")) {
            this.setItem("saqr_subjects", [
                { id: "s1", code: "ASE-401", name: "Advanced Software Engineering", credits: "12", department: "Computer Science", assignedLecturer: "lecturer" },
                { id: "s2", code: "DBMS-202", name: "Database Management Systems", credits: "12", department: "Information Technology", assignedLecturer: "lecturer" }
            ].map(Contract.subject));
        }
        if (!localStorage.getItem("saqr_tasks")) this.setItem("saqr_tasks", []);
        this.migrate();
    },
    migrate() {
        this.setItem("saqr_users", this.getItems("saqr_users").map(Contract.user));
        this.setItem("saqr_subjects", this.getItems("saqr_subjects").map(Contract.subject));
        this.setItem("saqr_tasks", this.getItems("saqr_tasks").map(Contract.task));
    },
    getItems(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch {
            return [];
        }
    },
    setItem(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }
};
MockDB.init();

class ApiClient {
    static async request(path, options = {}) {
        if (!SAQR_CONFIG.useRemoteApi) return null;

        const session = AuthService.getSession();
        const response = await fetch(`${SAQR_CONFIG.apiBaseUrl}${path}`, {
            method: options.method || "GET",
            headers: {
                "Content-Type": "application/json",
                ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
            },
            body: options.body ? JSON.stringify(options.body) : undefined
        });

        const payload = response.status === 204 ? null : await response.json().catch(() => null);
        if (!response.ok) throw new Error(payload?.message || `API request failed: ${response.status}`);
        return payload?.data ?? payload;
    }
}

class AuthService {
    static async login(email, password) {
        if (SAQR_CONFIG.useRemoteApi) {
            const remote = await ApiClient.request("/auth/login", { method: "POST", body: { email, password } });
            const user = Contract.user(remote.user || remote);
            localStorage.setItem("saqr_session", JSON.stringify({ ...user, token: remote.token || remote.accessToken || null }));
            return user;
        }

        const user = MockDB.getItems("saqr_users").find(u => u.email === email.trim().toLowerCase() && u.password === password);
        if (!user) throw new Error("Invalid email or password.");
        localStorage.setItem("saqr_session", JSON.stringify({ id: user.id, username: user.username, role: user.role, email: user.email }));
        return user;
    }

    static getSession() {
        try {
            return JSON.parse(localStorage.getItem("saqr_session")) || null;
        } catch {
            return null;
        }
    }

    static logout() {
        localStorage.removeItem("saqr_session");
        window.location.href = "../Public-Pages/login.html";
    }
}

class DataService {
    static async createUser(userData) {
        const user = Contract.user(userData);
        if (SAQR_CONFIG.useRemoteApi) return Contract.user(await ApiClient.request("/users", { method: "POST", body: user }));
        const users = MockDB.getItems("saqr_users");
        if (users.some(u => u.email === user.email)) throw new Error("A user with this email already exists.");
        users.push(user);
        MockDB.setItem("saqr_users", users);
        return user;
    }

    static async getUsersByRole(role) {
        const users = SAQR_CONFIG.useRemoteApi ? await ApiClient.request(`/users?role=${encodeURIComponent(role)}`) : MockDB.getItems("saqr_users");
        return users.map(Contract.user).filter(user => !role || user.role === role);
    }

    static async deleteUser(id) {
        if (SAQR_CONFIG.useRemoteApi) return ApiClient.request(`/users/${encodeURIComponent(id)}`, { method: "DELETE" });
        MockDB.setItem("saqr_users", MockDB.getItems("saqr_users").filter(user => user.id !== id));
    }

    static async getSubjects() {
        const subjects = SAQR_CONFIG.useRemoteApi ? await ApiClient.request("/subjects") : MockDB.getItems("saqr_subjects");
        return subjects.map(Contract.subject);
    }

    static async createSubject(subjectData) {
        const subject = Contract.subject(subjectData);
        if (SAQR_CONFIG.useRemoteApi) return Contract.subject(await ApiClient.request("/subjects", { method: "POST", body: subject }));
        const subjects = MockDB.getItems("saqr_subjects");
        subjects.push(subject);
        MockDB.setItem("saqr_subjects", subjects);
        return subject;
    }

    static async deleteSubject(id) {
        if (SAQR_CONFIG.useRemoteApi) return ApiClient.request(`/subjects/${encodeURIComponent(id)}`, { method: "DELETE" });
        MockDB.setItem("saqr_subjects", MockDB.getItems("saqr_subjects").filter(subject => subject.id !== id));
    }

    static async getTasks() {
        const tasks = SAQR_CONFIG.useRemoteApi ? await ApiClient.request("/tasks") : MockDB.getItems("saqr_tasks");
        return tasks.map(Contract.task);
    }

    static async createTask(taskData) {
        const task = Contract.task(taskData);
        if (SAQR_CONFIG.useRemoteApi) return Contract.task(await ApiClient.request("/tasks", { method: "POST", body: task }));
        const tasks = MockDB.getItems("saqr_tasks");
        tasks.push(task);
        MockDB.setItem("saqr_tasks", tasks);
        return task;
    }

    static async deleteTask(id) {
        if (SAQR_CONFIG.useRemoteApi) return ApiClient.request(`/tasks/${encodeURIComponent(id)}`, { method: "DELETE" });
        MockDB.setItem("saqr_tasks", MockDB.getItems("saqr_tasks").filter(task => task.id !== id));
    }

    static async getAllSystemDataRecords() {
        const [users, subjects, tasks] = await Promise.all([
            Promise.resolve(MockDB.getItems("saqr_users").map(Contract.user)),
            this.getSubjects(),
            this.getTasks()
        ]);
        return { users, subjects, tasks };
    }
}

const SystemLogEngine = {
    write: (eventMessage, level = "INFO") => {
        const logs = MockDB.getItems("saqr_logs");
        logs.unshift({ id: Date.now().toString(), timestamp: new Date().toLocaleString("en-US", { hour12: false }), level, message: eventMessage });
        MockDB.setItem("saqr_logs", logs.slice(0, 100));
    },
    get: () => MockDB.getItems("saqr_logs")
};

const NotificationEngine = {
    dispatch: (targetRole, targetUser, alertMessage) => {
        const notifications = MockDB.getItems("saqr_notifications");
        notifications.unshift({
            id: Date.now().toString(),
            targetRole,
            targetUser,
            message: alertMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            read: false
        });
        MockDB.setItem("saqr_notifications", notifications);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('a, button').forEach(el => {
        const text = el.textContent.trim().toLowerCase();
        if (text === "logout" || text === "log out") {
            el.addEventListener("click", event => {
                event.preventDefault();
                AuthService.logout();
            });
        }
    });

    document.querySelectorAll(".nav-icon").forEach(button => {
        button.addEventListener("click", () => {
            if (!window.location.pathname.includes("notifications.html")) {
                window.location.href = "notifications.html";
            }
        });
    });

    document.querySelectorAll(".profile-trigger").forEach(trigger => {
        trigger.addEventListener("click", () => {
            if (!window.location.pathname.includes("profile.html")) {
                window.location.href = "profile.html";
            }
        });
    });
});
