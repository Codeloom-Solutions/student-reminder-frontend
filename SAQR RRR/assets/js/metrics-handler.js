document.addEventListener("DOMContentLoaded", () => {
    // Locate standard analytics grid containers automatically
    const metricsContainer = document.querySelector(".analytics-grid") || document.querySelector(".workspace");
    if (!metricsContainer) return;

    const renderSystemAnalytics = () => {
        // Fetch raw state values directly
        const users = JSON.parse(localStorage.getItem('saqr_users')) || [];
        const tasks = JSON.parse(localStorage.getItem('saqr_tasks')) || [];
        const subjects = JSON.parse(localStorage.getItem('saqr_subjects')) || [];

        const studentCount = users.filter(u => u.role === "student" || u.username?.toLowerCase().includes("student")).length;
        const lecturerCount = users.filter(u => u.role === "lecturer" || u.username?.toLowerCase().includes("lecturer")).length;
        const courseCount = subjects.length;
        const taskCount = tasks.length;

        // Build metric layouts HTML string
        const dashboardSummaryHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; width: 100%; margin-bottom: 30px;">
                <div style="background: linear-gradient(135deg, #041E42, #0a3a75); color: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                    <h3 style="font-size: 0.9rem; text-transform: uppercase; opacity: 0.8; margin: 0;">Enrolled Students</h3>
                    <p style="font-size: 2.5rem; font-weight: bold; margin: 10px 0 0 0;">${studentCount}</p>
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

            <div style="background: white; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px; margin-top: 20px; margin-bottom: 25px;">
                <h3 style="color:#041E42; margin-top: 0; font-size:1.2rem; border-bottom:2px solid #f1f5f9; padding-bottom:10px;">Portal Matrix Breakdown Representation</h3>
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

        // SAFE FIX: Use a dedicated injection container so we don't clear or disrupt the workspace inner HTML layout
        let summaryWrapper = document.getElementById("saqr-summary-injection-wrapper");
        if (!summaryWrapper) {
            summaryWrapper = document.createElement("div");
            summaryWrapper.id = "saqr-summary-injection-wrapper";
            summaryWrapper.style.width = "100%";
            metricsContainer.prepend(summaryWrapper); // Inserts cleanly at the top without destructive overrides
        }
        summaryWrapper.innerHTML = dashboardSummaryHTML;
    };

    // Execute standard analytics build workflow
    renderSystemAnalytics();

    // =======================================================
    // NEW CODE INTEGRATION: INTERACTIVE OVERVIEW SVG METRIC
    // =======================================================
    const renderSVGChartPie = () => {
        // SAFE FIX: Target the unique text placeholder layout string directly, ignoring sidebars and nav components
        const chartPlaceholder = Array.from(document.querySelectorAll('*')).find(el => 
            el.textContent.trim().includes("Visual charts loop container active.") && 
            !el.closest('nav') && !el.closest('.sidebar')
        );

        if (!chartPlaceholder) {
            // Fallback: search safely by header card contextual position inside the main layout
            const fallbackCardHeader = Array.from(document.querySelectorAll('h3, h2')).find(el => 
                el.textContent.includes("Quick Overview Distribution") && 
                !el.closest('nav') && !el.closest('.sidebar')
            );
            
            if (fallbackCardHeader) {
                const parentNode = fallbackCardHeader.closest('div');
                const chartContentHolder = parentNode ? parentNode.querySelector('div:last-child') : null;
                if (chartContentHolder) executePieRendering(chartContentHolder);
            }
            return;
        }

        // If the exact loop container string element is active, use its direct container parent box
        const targetContainerBox = chartPlaceholder.parentElement;
        if (targetContainerBox) {
            executePieRendering(targetContainerBox);
        }
    };

    // Isolated internal drawer for rendering the actual SVG component properties
    const executePieRendering = (targetElement) => {
        const users = JSON.parse(localStorage.getItem('saqr_users')) || [];
        const studentCount = users.filter(u => u.role === "student" || u.username?.toLowerCase().includes("student")).length || 1;
        const lecturerCount = users.filter(u => u.role === "lecturer" || u.username?.toLowerCase().includes("lecturer")).length || 1;
        
        const total = studentCount + lecturerCount;
        const studentPercent = Math.round((studentCount / total) * 100);
        const lecturerPercent = Math.round((lecturerCount / total) * 100);

        targetElement.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; padding:10px 0; width:100%;">
                <svg width="140" height="140" viewBox="0 0 32 32" style="transform: rotate(-90deg); border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
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
    };
    
    // Deploy SVG pie generation matrix updates
    renderSVGChartPie();
});
