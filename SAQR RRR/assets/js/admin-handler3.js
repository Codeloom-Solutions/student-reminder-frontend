document.addEventListener("DOMContentLoaded", () => {
    console.log("SAQR Core Engine Active...");

    // 1. Locate the main workspace area safely
    const metricsContainer = document.querySelector(".analytics-grid") || document.querySelector(".workspace");
    if (!metricsContainer) return;

    // 2. Fetch data states from LocalStorage with fallback arrays
    const users = JSON.parse(localStorage.getItem('saqr_users')) || [];
    const tasks = JSON.parse(localStorage.getItem('saqr_tasks')) || [];
    const subjects = JSON.parse(localStorage.getItem('saqr_subjects')) || [];

    // Filter roles accurately
    const studentCount = users.filter(u => u.role === "student" || u.username?.toLowerCase().includes("student")).length;
    const lecturerCount = users.filter(u => u.role === "lecturer" || u.username?.toLowerCase().includes("lecturer")).length;
    const courseCount = subjects.length;
    const taskCount = tasks.length;

    // Calculate chart breakdown percentages
    const totalChartCount = studentCount + lecturerCount || 2;
    const studentPercent = Math.round((studentCount / totalChartCount) * 100) || 50;
    const lecturerPercent = Math.round((lecturerCount / totalChartCount) * 100) || 50;

    // =======================================================
    // PART A: RENDER DASHBOARD COUNTERS & PROGRESS BARS
    // =======================================================
    const renderSystemAnalytics = () => {
        const dashboardSummaryHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; width: 100%; margin-bottom: 30px; box-sizing: border-box;">
                <div style="background: linear-gradient(135deg, #041E42, #0a3a75); color: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                    <h3 style="font-size: 0.9rem; text-transform: uppercase; opacity: 0.8; margin: 0; color: white;">Enrolled Students</h3>
                    <p style="font-size: 2.5rem; font-weight: bold; margin: 10px 0 0 0; color: white;">${studentCount}</p>
                </div>
                <div style="background: white; border: 1px solid #e2e8f0; color: #1e293b; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                    <h3 style="font-size: 0.9rem; text-transform: uppercase; color: #64748b; margin: 0;">Faculty Staff</h3>
                    <p style="font-size: 2.5rem; font-weight: bold; color: #041E42; margin: 10px 0 0 0;">${lecturerCount}</p>
                </div>
                <div style="background: white; border: 1px solid #e2e8f0; color: #1e293b; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                    <h3 style="font-size: 0.9rem; text-transform: uppercase; color: #64748b; margin: 0;">Active Course Curriculums</h3>
                    <p style="font-size: 2.5rem; font-weight: bold; color: #041E42; margin: 10px 0 0 0;">${courseCount}</p>
                </div>
                <div style="background: white; border: 1px solid #e2e8f0; color: #1e293b; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                    <h3 style="font-size: 0.9rem; text-transform: uppercase; color: #64748b; margin: 0;">Total Tasks Issued</h3>
                    <p style="font-size: 2.5rem; font-weight: bold; color: #041E42; margin: 10px 0 0 0;">${taskCount}</p>
                </div>
            </div>

            <div style="background: white; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px; margin-top: 20px; margin-bottom: 25px; box-sizing: border-box; width: 100%;">
                <h3 style="color:#041E42; margin-top: 0; font-size:1.2rem; border-bottom:2px solid #f1f5f9; padding-bottom:10px; font-weight: 700;">Portal Matrix Breakdown Representation</h3>
                <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">
                    <div>
                        <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:600; color:#475569; margin-bottom:4px;"><span>Students Proportion</span><span>${studentCount} Profiles</span></div>
                        <div style="background: #e2e8f0; height: 12px; border-radius: 6px; overflow: hidden;"><div style="background: #3b82f6; width: ${Math.min(studentCount * 10, 100)}%; height: 100%; transition: width 0.5s ease;"></div></div>
                    </div>
                    <div>
                        <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:600; color:#475569; margin-bottom:4px;"><span>Lecturer Staff Proportion</span><span>${lecturerCount} Profiles</span></div>
                        <div style="background: #e2e8f0; height: 12px; border-radius: 6px; overflow: hidden;"><div style="background: #10b981; width: ${Math.min(lecturerCount * 10, 100)}%; height: 100%; transition: width 0.5s ease;"></div></div>
                    </div>
                    <div>
                        <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:600; color:#475569; margin-bottom:4px;"><span>Tasks Deployed Distribution</span><span>${taskCount} Metrics</span></div>
                        <div style="background: #e2e8f0; height: 12px; border-radius: 6px; overflow: hidden;"><div style="background: #f59e0b; width: ${Math.min(taskCount * 10, 100)}%; height: 100%; transition: width 0.5s ease;"></div></div>
                    </div>
                </div>
            </div>
        `;

        // Check if our injection element already exists to avoid layout shifting on re-renders
        let injectionTarget = document.getElementById("saqr-metrics-injected-block");
        if (!injectionTarget) {
            injectionTarget = document.createElement("div");
            injectionTarget.id = "saqr-metrics-injected-block";
            injectionTarget.style.width = "100%";
            
            if (metricsContainer.classList.contains("workspace")) {
                metricsContainer.prepend(injectionTarget); // Places panels safely right at the top layout slot
            } else {
                metricsContainer.appendChild(injectionTarget);
            }
        }
        injectionTarget.innerHTML = dashboardSummaryHTML;
    };

    renderSystemAnalytics();

    // =======================================================
    // PART B: RENDER INTERACTIVE SVG PIE CHART (CARD PROTECTED)
    // =======================================================
    const renderSVGChartPie = () => {
        // Safe contextual filter: Look for Overview headers completely outside the navigation blocks
        const chartHeaderEl = Array.from(document.querySelectorAll('h3, h2, div')).find(el => {
            const text = el.textContent.trim();
            return (text.includes("Quick Overview Distribution") || text.includes("Visual charts loop container active.")) 
                   && !el.closest('nav') && !el.closest('.sidebar');
        });

        if (!chartHeaderEl) return;

        // Trace to the closest card context block element securely
        const cardParent = chartHeaderEl.closest('div');
        if (!cardParent) return;

        // Target the layout payload inner slot
        let chartContentHolder = cardParent.querySelector('.saqr-chart-holder-slot') || cardParent.querySelector('div:last-child');
        
        if (chartContentHolder) {
            // Assign a persistent structural class flag to prevent recursive component mismatching
            chartContentHolder.classList.add('saqr-chart-holder-slot');
            
            chartContentHolder.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; padding:15px 0; width:100%;">
                    <svg width="140" height="140" viewBox="0 0 32 32" style="transform: rotate(-90deg); border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.04);">
                        <circle r="16" cx="16" cy="16" fill="#10b981" />
                        <circle r="16" cx="16" cy="16" fill="transparent" stroke="#3b82f6" stroke-width="32" stroke-dasharray="${studentPercent} 100" />
                    </svg>
                    
                    <div style="display:flex; gap:20px; font-size:0.85rem; font-weight:600; justify-content:center; width:100%;">
                        <div style="display:flex; align-items:center; gap:6px; color:#334155;">
                            <span style="width:11px; height:11px; background:#3b82f6; display:inline-block; border-radius:3px;"></span>
                            Students (${studentPercent}%)
                        </div>
                        <div style="display:flex; align-items:center; gap:6px; color:#334155;">
                            <span style="width:11px; height:11px; background:#10b981; display:inline-block; border-radius:3px;"></span>
                            Faculty (${lecturerPercent}%)
                        </div>
                    </div>
                </div>`;
        }
    };
    
    renderSVGChartPie();
});

document.addEventListener("DOMContentLoaded", () => {
    console.log("SAQR Admin Handler Active: Scanning workspace...");

    // 1. Fetch data safely from LocalStorage with fallback defaults
    const allUsers = JSON.parse(localStorage.getItem('saqr_users')) || [];
    const allSubjects = JSON.parse(localStorage.getItem('saqr_subjects')) || [];
    const allTasks = JSON.parse(localStorage.getItem('saqr_tasks')) || [];
    const allLogs = JSON.parse(localStorage.getItem('saqr_logs')) || [];

    // 2. Calculate dynamic global metrics
    const totalStudents = allUsers.filter(u => u.role?.toLowerCase() === "student" || u.username?.toLowerCase().includes("student")).length;
    const totalLecturers = allUsers.filter(u => u.role?.toLowerCase() === "lecturer" || u.username?.toLowerCase().includes("lecturer")).length;
    const totalSubjects = allSubjects.length;
    const totalTasks = allTasks.length;

    console.log(`Current State Data -> Students: ${totalStudents}, Lecturers: ${totalLecturers}, Subjects: ${totalSubjects}, Tasks: ${totalTasks}, Logs: ${allLogs.length}`);

    // ====================================================================
    // PART A: UPDATE TOP METRIC PROGRESS BARS
    // ====================================================================
    const updateMetricBar = (keyword, countValue, displayUnit) => {
        // Find any element matching the label text exactly
        const elements = Array.from(document.querySelectorAll('div, p, span, td, h4'));
        const labelEl = elements.find(el => el.textContent.trim().toLowerCase() === keyword.toLowerCase() && el.children.length === 0);

        if (labelEl) {
            // Find the nearest container row holding both the label and the count value
            const containerRow = labelEl.closest('div') || labelEl.parentElement;
            if (containerRow) {
                // Update the text box displaying the count metric (e.g., "0 Metrics" -> "1 Metrics")
                const textNodes = Array.from(containerRow.querySelectorAll('*'));
                const valueNode = textNodes.find(node => 
                    node.textContent.includes("Profiles") || 
                    node.textContent.includes("Metrics") || 
                    /^\d+$/.test(node.textContent.trim())
                );
                if (valueNode) {
                    valueNode.textContent = `${countValue} ${displayUnit}`;
                }

                // Locate and fill the visual color progress bar fill line below it
                const visualParent = containerRow.parentElement;
                if (visualParent) {
                    const progressBarFill = visualParent.querySelector('[style*="width"], .progress-bar, div > div');
                    if (progressBarFill && progressBarFill !== containerRow) {
                        const ceiling = Math.max(totalStudents, totalLecturers, totalTasks, 5);
                        const percentage = Math.min((countValue / ceiling) * 100, 100);
                        progressBarFill.style.width = `${percentage}%`;
                        progressBarFill.style.transition = "width 0.5s ease-in-out";
                    }
                }
            }
        }
    };

    updateMetricBar("Students Proportion", totalStudents, "Profiles");
    updateMetricBar("Lecturer Staff Proportion", totalLecturers, "Profiles");
    updateMetricBar("Tasks Deployed Distribution", totalTasks, "Metrics");

    // ====================================================================
    // PART B: INJECT INTO DASHBOARD GREY CARDS (Logs & Notifications)
    // ====================================================================
    const pageElements = Array.from(document.querySelectorAll('div, h2, h3, h4, section'));

    // --- 1. Populate System Logs Card ---
    const logsHeader = pageElements.find(el => el.textContent.trim().toLowerCase() === "system logs");
    if (logsHeader) {
        const targetBox = logsHeader.closest('div'); // Get the grey container card box
        if (targetBox) {
            // Clean out old placeholder space while keeping header title intact
            let logWrapper = targetBox.querySelector('.dynamic-log-container');
            if (!logWrapper) {
                logWrapper = document.createElement('div');
                logWrapper.className = 'dynamic-log-container';
                logWrapper.style.cssText = "margin-top: 15px; display: flex; flex-direction: column; gap: 8px; max-height: 220px; overflow-y: auto; width: 100%; text-align: left;";
                targetBox.appendChild(logWrapper);
            }

            if (allLogs.length === 0) {
                logWrapper.innerHTML = `<p style="color: #64748b; font-size: 0.85rem; margin: 0; font-style: italic;">No system logs or activities recorded yet.</p>`;
            } else {
                logWrapper.innerHTML = allLogs.slice(-4).reverse().map(log => `
                    <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; font-size: 0.85rem; color: #1e293b;">
                        <span style="color: #041E42; font-weight: 600;">[LOG]</span> ${log.action || log.message || "System Action"}
                        <div style="font-size: 0.75rem; color: #64748b; margin-top: 2px;">${log.timestamp || 'Recent'}</div>
                    </div>
                `).join('');
            }
        }
    }

    // --- 2. Populate Notifications Card ---
    const notifyHeader = pageElements.find(el => el.textContent.trim().toLowerCase() === "notifications");
    if (notifyHeader) {
        const targetBox = notifyHeader.closest('div');
        if (targetBox) {
            let notifyWrapper = targetBox.querySelector('.dynamic-notify-container');
            if (!notifyWrapper) {
                notifyWrapper = document.createElement('div');
                notifyWrapper.className = 'dynamic-notify-container';
                notifyWrapper.style.cssText = "margin-top: 15px; text-align: left; width: 100%;";
                targetBox.appendChild(notifyWrapper);
            }

            notifyWrapper.innerHTML = `
                <div style="background: #f8fafc; border-left: 4px solid #041E42; padding: 10px; border-radius: 4px; font-size: 0.85rem;">
                    <span style="font-weight: 600; color: #041E42; display: block; margin-bottom: 2px;">System Infrastructure Status</span>
                    <p style="margin: 0; color: #475569;">Environment fully operational. Monitoring <strong>${allUsers.length}</strong> authentication accounts across all directories.</p>
                </div>`;
        }
    }

    // ====================================================================
    // PART C: UPDATE SYSTEM REPORTS ANALYTICS MATRIX TABLE
    // ====================================================================
    const tableRows = Array.from(document.querySelectorAll('table tr, tr'));
    tableRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
            const rowLabel = cells[0].textContent.trim().toLowerCase();

            if (rowLabel.includes("active class schedules")) {
                cells[1].textContent = totalSubjects;
                cells[1].style.fontWeight = "700";
            } else if (rowLabel.includes("student evaluation records")) {
                cells[1].textContent = totalTasks;
                cells[1].style.fontWeight = "700";
            }
        }
    });
});