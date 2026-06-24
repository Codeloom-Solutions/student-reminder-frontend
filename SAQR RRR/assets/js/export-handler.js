document.addEventListener("DOMContentLoaded", () => {
    const exportForm = document.querySelector("form") || document.querySelector(".workspace");
    if (!exportForm) return;

    // Detect execution button patterns dynamically from code blocks
    const triggerActionBtn = exportForm.querySelector('button[type="submit"]') || exportForm.querySelector('.capsule-btn-dark');
    
    if (triggerActionBtn) {
        triggerActionBtn.addEventListener("click", async (e) => {
            e.preventDefault();

            // Resolve inputs dynamically based on typical form component naming styles
            const exportSelectionElement = exportForm.querySelector('select[name="export-format"]') || exportForm.querySelector('select');
            const datatypeSelectionElement = exportForm.querySelector('select[name="data-type"]') || { value: "all" };
            
            const formatSelected = exportSelectionElement ? exportSelectionElement.value : "csv";
            
            // Extract raw data from core engine
            const targetData = await DataService.getAllSystemDataRecords();
            
            if (formatSelected === "csv") {
                compileAndDownloadCSV(targetData);
            } else if (formatSelected === "excel") {
                compileAndDownloadExcel(targetData);
            } else if (formatSelected === "pdf") {
                compileAndDownloadMockPDF(targetData);
            }
        });
    }

    function compileAndDownloadCSV(data) {
        let content = "System Category,Record ID,Primary Title/User,Identity/Context,Meta Field\n";
        
        data.users.forEach(u => {
            content += `User Account,${u.id},${u.username},${u.email},Role Base: ${u.role}\n`;
        });
        data.tasks.forEach(t => {
            content += `Task Metric,${t.id},${t.title},${t.subject},Type: ${t.type}\n`;
        });

        triggerFileDownload(content, "application/csv", "SAQR_Database_Export.csv");
    }

    function compileAndDownloadExcel(data) {
        // Generates an cleanly read Excel XML component sheet mapping grid matrix rows directly
        let excelContent = `xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"></head><body><table>`;
        
        excelContent += "<tr><th>System Category</th><th>Record ID</th><th>Primary Title/User</th><th>Identity/Context</th><th>Meta Field</th></tr>";
        data.users.forEach(u => {
            excelContent += `<tr><td>User Account</td><td>${u.id}</td><td>${u.username}</td><td>${u.email}</td><td>${u.role}</td></tr>`;
        });
        data.tasks.forEach(t => {
            excelContent += `<tr><td>Task Metric</td><td>${t.id}</td><td>${t.title}</td><td>${t.subject}</td><td>${t.type}</td></tr>`;
        });
        excelContent += "</table></body></html>";

        triggerFileDownload(excelContent, "application/vnd.ms-excel", "SAQR_Database_Export.xls");
    }

    function compileAndDownloadMockPDF(data) {
        // Without modification injection constraints, generating native canvas binaries is impossible without libraries.
        // We compile a layout report data summary file.
        let pdfReportLayout = `=======================================================\n`;
        pdfReportLayout += `      SAQR DIGITAL PORTAL SYSTEM DATA EXPORT MASTER    \n`;
        pdfReportLayout += `=======================================================\n\n`;
        
        pdfReportLayout += `--- CORE USER CREDENTIAL PROVISIONS ---\n`;
        data.users.forEach(u => {
            pdfReportLayout += `ID: ${u.id} | Ident: ${u.username.padEnd(12)} | Mail: ${u.email.padEnd(20)} | Privilege: ${u.role}\n`;
        });

        pdfReportLayout += `\n--- EVALUATION TASKS / COURSE ASSIGNMENTS ---\n`;
        data.tasks.forEach(t => {
            pdfReportLayout += `ID: ${t.id} | Class: ${t.subject.padEnd(12)} | Assignment Title: ${t.title.padEnd(20)} | Method: ${t.type}\n`;
        });

        triggerFileDownload(pdfReportLayout, "text/plain", "SAQR_Report_Layout.pdf");
    }

    function triggerFileDownload(content, mimeType, filename) {
        const structuralBlob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
        const temporaryLink = document.createElement("a");
        
        const spatialURL = URL.createObjectURL(structuralBlob);
        temporaryLink.setAttribute("href", spatialURL);
        temporaryLink.setAttribute("download", filename);
        temporaryLink.style.visibility = 'hidden';
        
        document.body.appendChild(temporaryLink);
        temporaryLink.click();
        document.body.removeChild(temporaryLink);
    }
});