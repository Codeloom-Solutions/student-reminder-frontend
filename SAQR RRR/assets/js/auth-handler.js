document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("form");
    if (!loginForm) return;

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const emailInput = loginForm.querySelector('input[type="text"], input[type="email"]');
        const passwordInput = loginForm.querySelector('input[type="password"]');
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        if (!emailInput.value || !passwordInput.value) {
            alert("Please complete all credentials blocks.");
            return;
        }

        try {
            if (submitBtn) submitBtn.disabled = true;
            
            const user = await AuthService.login(emailInput.value, passwordInput.value);
            
            // Context-Aware Portal Routing Matrix
            switch(user.role) {
                case "admin":
                    window.location.href = "../Admin User/dashboard.html";
                    break;
                case "lecturer":
                    window.location.href = "../Lecturer User/dashboard.html";
                    break;
                case "student":
                    window.location.href = "../Student User/dashboard.html";
                    break;
                default:
                    alert("Unknown role allocation system error.");
            }
        } catch (error) {
            alert(error.message);
            if (submitBtn) submitBtn.disabled = false;
        }
    });
});