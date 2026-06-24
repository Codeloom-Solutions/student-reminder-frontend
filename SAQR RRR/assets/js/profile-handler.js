document.addEventListener("DOMContentLoaded", () => {
    const saveSettingsBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.toLowerCase().includes("save") || btn.textContent.toLowerCase().includes("create"));
    
    if (window.location.pathname.includes("profile")) {
        // Load existing checkbox settings on page load
        const savedTogglesState = JSON.parse(localStorage.getItem('saqr_system_toggle_matrix')) || { alert: true, email: false, sms: false, tfa: false };
        const explicitCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        
        if (explicitCheckboxes.length >= 3) {
            explicitCheckboxes[0].checked = savedTogglesState.alert;
            explicitCheckboxes[1].checked = savedTogglesState.email;
            explicitCheckboxes[2].checked = savedTogglesState.sms;
            if(explicitCheckboxes[3]) explicitCheckboxes[3].checked = savedTogglesState.tfa;
        }

        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener("click", (e) => {
                e.preventDefault();
                
                const sessionUser = JSON.parse(localStorage.getItem('saqr_session'));
                const newPasswordInput = document.querySelector('input[type="password"]');
                
                if (newPasswordInput && newPasswordInput.value.trim() !== "") {
                    let userPool = JSON.parse(localStorage.getItem('saqr_users')) || [];
                    userPool = userPool.map(u => {
                        if (u.username === sessionUser.username) {
                            u.password = newPasswordInput.value;
                        }
                        return u;
                    });
                    localStorage.setItem('saqr_users', JSON.stringify(userPool));
                    
                    SystemLogEngine.write(`User profile configuration updates committed by profile holder: ${sessionUser.username}`, "SECURITY");
                    NotificationEngine.dispatch(sessionUser.role, sessionUser.username, "Security confirmation: Your account access password data was adjusted successfully.");
                }

                // Collect checkbox states
                if (explicitCheckboxes.length >= 3) {
                    const currentToggles = {
                        alert: explicitCheckboxes[0].checked,
                        email: explicitCheckboxes[1].checked,
                        sms: explicitCheckboxes[2].checked,
                        tfa: explicitCheckboxes[3] ? explicitCheckboxes[3].checked : false
                    };
                    localStorage.setItem('saqr_system_toggle_matrix', JSON.stringify(currentToggles));
                }

                alert("Profile changes and system overrides updated successfully!");
            });
        }
    }
});