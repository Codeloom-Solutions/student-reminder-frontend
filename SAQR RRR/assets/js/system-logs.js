document.addEventListener("DOMContentLoaded", () => {
    const logsContainer = document.querySelector(".workspace") || document.querySelector("body");
    
    // Check if we are viewing the dedicated logs history sheet
    if (window.location.pathname.includes("system-logs") || window.location.pathname.includes("system_logs")) {
        const rawLogs = SystemLogEngine.get();
        let tableRowsHTML = `
            <div style="background:white; border:1px solid #e2e8f0; border-radius:12px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                <div style="display:grid; grid-template-columns: 180px 120px 1fr; background:#f8fafc; padding:12px; font-weight:bold; border-radius:6px; color:#475569;">
                    <div>Timestamp</div>
                    <div>Log Level</div>
                    <div>Event Message / Details</div>
                </div>
                <div style="margin-top:10px; display:flex; flex-direction:column; gap:8px;">
        `;

        if (rawLogs.length === 0) {
            tableRowsHTML += `<div style="text-align:center; padding:20px; color:#94a3b8;">No diagnostic event logs found on this environment pipeline instance.</div>`;
        } else {
            rawLogs.forEach(log => {
                const badgeColor = log.level === "SECURITY" ? "#ef4444" : "#3b82f6";
                tableRowsHTML += `
                    <div style="display:grid; grid-template-columns: 180px 120px 1fr; padding:12px; border-bottom:1px solid #f1f5f9; font-size:0.9rem; align-items:center;">
                        <div style="color:#64748b;">${log.timestamp}</div>
                        <div><span style="background:${badgeColor}20; color:${badgeColor}; padding:3px 8px; border-radius:4px; font-weight:600; font-size:0.75rem;">${log.level}</span></div>
                        <div style="color:#1e293b; font-weight:500;">${log.message}</div>
                    </div>`;
            });
        }

        tableRowsHTML += `</div></div>`;
        
        // Find existing table component wrapper frame if it exists to replace it cleanly
        const existingWrapper = document.querySelector(".data-list-wrapper") || document.querySelector("table");
        if (existingWrapper) {
            existingWrapper.outerHTML = tableRowsHTML;
        }
    }
});