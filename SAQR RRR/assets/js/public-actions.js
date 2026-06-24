document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".toggle-eye, .toggle-pwd").forEach(button => {
        button.addEventListener("click", () => {
            const wrapper = button.closest(".input-wrap") || button.parentElement;
            const input = wrapper?.querySelector('input[type="password"], input[type="text"]');
            if (!input) return;
            const showPassword = input.type === "password";
            input.type = showPassword ? "text" : "password";
            button.setAttribute("aria-label", showPassword ? "Hide password" : "Show password");
        });
    });

    document.querySelectorAll('a[href="#"]').forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();
            if (link.textContent.trim().toLowerCase().includes("forgot password")) {
                alert("Use the student change-password page after logging in, or contact the SAQR administrator for a reset.");
            }
        });
    });
});
