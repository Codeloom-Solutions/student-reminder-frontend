 // Mock export engine for the SAQR system, which allows users to download system logs or user data in JSON format. without backend for now.

document.addEventListener("DOMContentLoaded", () => {
    const downloadBtn = Array.from(document.querySelectorAll('button, a')).find(b => b.textContent.includes("Execute Generation Download") || b.textContent.includes("Export Dataset"));
    if (!downloadBtn) return;

    downloadBtn.addEventListener("click", (e) => {
        e.preventDefault();

        // Detect selected data structure choice inside screen menu selector dropdown
        const chosenSelect = document.querySelector('select');
        const selectionValue = chosenSelect ? chosenSelect.value : "System Interaction Logs History";
        
        let extractedTargetData = [];
        let filenameStr = "saqr-export.csv";

        if (selectionValue.includes("Logs")) {
            extractedTargetData = localStorage.getItem('saqr_logs') || "[]";
            filenameStr = "saqr_system_diagnostic_logs.json";
        } else {
            extractedTargetData = localStorage.getItem('saqr_users') || "[]";
            filenameStr = "saqr_user_directory_matrix.json";
        }

        // Generate down-stream browser data transfer link allocation anchor allocation
        const blobObject = new Blob([typeof extractedTargetData === 'string' ? extractedTargetData : JSON.stringify(extractedTargetData, null, 2)], { type: "application/json" });
        const temporaryLink = document.createElement("a");
        
        temporaryLink.href = URL.createObjectURL(blobObject);
        temporaryLink.download = filenameStr;
        document.body.appendChild(temporaryLink);
        temporaryLink.click();
        document.body.removeChild(temporaryLink);

        SystemLogEngine.write(`Database tables compiled and extracted down via micro client export browser stream`, "INFO");
        alert(`System Engine: Compiled collection successfully! File processing finished. Look at your computer's downloads for: ${filenameStr}`);
    });
});