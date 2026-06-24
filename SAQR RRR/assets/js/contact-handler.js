document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.querySelector("form");
    if (!contactForm) return;

    // --- CAPTCHA Generator Engine ---
    let generatedCaptcha = "";
    
    // Dynamically locate or inject a visual CAPTCHA display wrapper block
    const captchaInput = contactForm.querySelector('input[name*="captcha"]') || contactForm.querySelector('.input-element:last-of-type');
    const captchaDisplayBox = document.createElement("div");
    
    // Style the visual captcha badge dynamically to look secure and modern
    captchaDisplayBox.style.cssText = `
        background: repeating-linear-gradient(45deg, #e2e8f0, #f1f5f9 10px);
        color: #041E42;
        font-family: 'Courier New', monospace;
        font-weight: bold;
        font-size: 1.3rem;
        letter-spacing: 6px;
        padding: 10px;
        text-align: center;
        margin: 10px 0;
        border-radius: 8px;
        user-select: none;
        border: 1px dashed #cbd5e1;
    `;
    
    if (captchaInput && captchaInput.parentNode) {
        captchaInput.parentNode.insertBefore(captchaDisplayBox, captchaInput);
    }

    function generateNewCaptcha() {
        const characters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"; // Removed ambiguous characters like 1, l, O, 0
        let result = "";
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        generatedCaptcha = result;
        captchaDisplayBox.textContent = generatedCaptcha;
    }
    
    generateNewCaptcha(); // Seed initial captcha code

    const refreshCaptchaBtn = document.getElementById("captcha-refresh");
    if (refreshCaptchaBtn) {
        refreshCaptchaBtn.addEventListener("click", () => {
            generateNewCaptcha();
            if (captchaInput) captchaInput.value = "";
        });
    }

    // --- Validation & Red Error Message Dispatcher ---
    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        let systemIsValid = true;

        // Clear out any previous error states from earlier submission attempts
        contactForm.querySelectorAll(".js-error-msg").forEach(el => el.remove());
        contactForm.querySelectorAll(".input-element").forEach(input => {
            input.style.borderColor = "";
        });

        // Scan form inputs
        const targetInputs = contactForm.querySelectorAll("input, textarea, select");
        targetInputs.forEach(input => {
            // Ignore hidden components or submit buttons
            if (input.type === "submit" || input.type === "reset" || input.type === "hidden") return;

            if (!input.value.trim()) {
                systemIsValid = false;
                input.style.borderColor = "#ef4444"; // Set box border to soft red
                
                // Construct a red warning element
                const errorLabel = document.createElement("span");
                errorLabel.className = "js-error-msg";
                errorLabel.textContent = "This information block is required.";
                errorLabel.style.cssText = "color: #ef4444; font-size: 0.8rem; font-weight: 600; margin-top: 4px; display: block;";
                
                input.parentNode.appendChild(errorLabel);
            }
        });

        // Verify Captcha Content match explicitly if input exists
        if (captchaInput && captchaInput.value.trim() !== generatedCaptcha) {
            systemIsValid = false;
            captchaInput.style.borderColor = "#ef4444";
            
            const errorLabel = document.createElement("span");
            errorLabel.className = "js-error-msg";
            errorLabel.textContent = "CAPTCHA entry code does not match. Please try again.";
            errorLabel.style.cssText = "color: #ef4444; font-size: 0.8rem; font-weight: 600; margin-top: 4px; display: block;";
            
            captchaInput.parentNode.appendChild(errorLabel);
            generateNewCaptcha(); // Cycle captcha immediately on security match failure
            captchaInput.value = "";
        }

        if (systemIsValid) {
            alert("Your contact request data message has been dispatched successfully!");
            contactForm.reset();
            generateNewCaptcha();
        }
    });
});
