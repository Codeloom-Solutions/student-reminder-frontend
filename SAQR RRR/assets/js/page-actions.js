document.addEventListener("DOMContentLoaded", () => {
    const session = AuthService.getSession();
    const pathname = window.location.pathname;

    const pageRole = pathname.includes("Admin User") ? "admin" : pathname.includes("Lecturer User") ? "lecturer" : pathname.includes("Student User") ? "student" : "public";
    const scopedKey = `saqr_page_settings_${pageRole}_${session?.username || "guest"}`;

    if (pathname.includes("notifications.html")) {
        const target = document.getElementById("notifications-feed-container") || document.getElementById("global-notifications-stack-target");
        const notifications = MockDB.getItems("saqr_notifications").filter(item => {
            return item.targetRole === "all" || item.targetRole === pageRole || item.targetUser === session?.username || item.targetUser === "all";
        });

        if (target) {
            target.innerHTML = notifications.length === 0
                ? `<div style="padding:18px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; color:#64748b;">No notifications yet.</div>`
                : notifications.map(item => `
                    <div style="padding:14px 16px; background:#fff; border-left:4px solid #041E42; border-radius:6px; margin-bottom:10px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                        <strong style="display:block; color:#041E42; margin-bottom:4px;">${item.targetRole.toUpperCase()} Notification</strong>
                        <span style="display:block; color:#334155;">${item.message}</span>
                        <small style="display:block; color:#64748b; margin-top:6px;">${item.timestamp}</small>
                    </div>
                `).join("");
        }
    }

    if (pathname.includes("settings.html") || pathname.includes("notifications.html")) {
        const saved = JSON.parse(localStorage.getItem(scopedKey) || "{}");
        document.querySelectorAll("input").forEach(input => {
            if (!input.name && !input.id) return;
            const key = input.name || input.id;
            if (input.type === "checkbox") input.checked = Boolean(saved[key]);
            else if (saved[key]) input.value = saved[key];

            input.addEventListener("change", () => {
                const next = JSON.parse(localStorage.getItem(scopedKey) || "{}");
                next[key] = input.type === "checkbox" ? input.checked : input.value;
                localStorage.setItem(scopedKey, JSON.stringify(next));
            });
        });
    }

    if (pathname.includes("change-password.html")) {
        const form = document.querySelector("form");
        const otpButton = document.querySelector(".otp-btn");
        const emailInput = document.querySelector('[name="verify-email"]');
        const otpInput = document.querySelector('[name="otp-code"]');

        if (emailInput && session?.email) emailInput.value = session.email;

        otpButton?.addEventListener("click", () => {
            const email = emailInput?.value.trim();
            if (!email) {
                alert("Enter your email before requesting an OTP.");
                return;
            }
            const code = String(Math.floor(100000 + Math.random() * 900000));
            localStorage.setItem(`saqr_otp_${email}`, code);
            alert(`Demo OTP generated: ${code}`);
        });

        form?.addEventListener("submit", (event) => {
            event.preventDefault();
            const email = emailInput?.value.trim();
            const expectedOtp = localStorage.getItem(`saqr_otp_${email}`);
            const passwords = form.querySelectorAll('input[type="password"]');
            const newPassword = passwords[0]?.value;
            const confirmPassword = passwords[1]?.value;

            if (!email || !otpInput?.value.trim()) {
                alert("Enter your email and OTP before changing password.");
                return;
            }
            if (expectedOtp && otpInput.value.trim() !== expectedOtp) {
                alert("OTP does not match.");
                return;
            }
            if (!newPassword || newPassword !== confirmPassword) {
                alert("Password fields are empty or do not match.");
                return;
            }

            const users = MockDB.getItems("saqr_users").map(user => user.email === email.toLowerCase() ? { ...user, password: newPassword } : user);
            MockDB.setItem("saqr_users", users);
            SystemLogEngine.write(`Password changed by ${session?.username || email}`, "SECURITY");
            localStorage.removeItem(`saqr_otp_${email}`);
            alert("Password updated successfully.");
            form.reset();
        });
    }
});
