document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById("courses-table-body");
    if (!tableBody) return;

    tableBody.innerHTML = "";
    const subjects = await DataService.getSubjects();

    if (subjects.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; padding:30px; color:#64748b !important; font-style:italic; font-size:1rem; background-color:#f8fafc;">
                    No academic modules have been deployed by administration yet.
                </td>
            </tr>`;
        return;
    }

    tableBody.innerHTML = subjects.map(subject => `
        <tr style="border-bottom:1px solid #cbd5e1; background-color:#ffffff;">
            <td style="padding:18px 15px; font-weight:700; color:#041E42 !important; font-size:0.95rem; text-align:left;">${subject.code || "N/A"}</td>
            <td style="padding:18px 15px; font-weight:600; color:#1e293b !important; font-size:0.95rem; text-align:left;">${subject.name || "Untitled Course Module"}</td>
            <td style="padding:18px 15px; color:#475569 !important; font-size:0.95rem; text-align:left;">${subject.credits || "0"} Credits</td>
            <td style="padding:18px 15px; font-weight:600; color:#334155 !important; font-size:0.95rem; text-align:left;">${subject.assignedLecturer || "No Faculty Assigned"}</td>
        </tr>
    `).join("");
});
