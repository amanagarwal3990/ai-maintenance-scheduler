// Machine Maintenance Scheduler JavaScript

class MachineMaintenanceScheduler {
    constructor() {
        this.machines = JSON.parse(localStorage.getItem('machines')) || [];
        this.savedSchedules = JSON.parse(localStorage.getItem('savedSchedules')) || [];
        this.currentSchedule = null;
        this.isPremiumUser = false; // Mock non-premium user by default
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSavedSchedulesOnStartup();
    }

    bindEvents() {
        const form = document.getElementById('machineForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    loadSavedSchedulesOnStartup() {
        // Show saved schedules section if there are any saved schedules
        if (this.savedSchedules.length > 0) {
            this.displaySavedSchedules();
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(e.target);
        const machineData = {
            name: formData.get('machineName'),
            lastServicedDate: formData.get('lastServicedDate'),
            usageFrequency: formData.get('usageFrequency')
        };

        // Generate maintenance schedule
        const schedule = this.generateMaintenanceSchedule(machineData);
        
        // Store current schedule for saving
        this.currentSchedule = {
            machineData: machineData,
            schedule: schedule,
            generatedAt: new Date().toISOString()
        };
        
        // Save machine data
        this.saveMachineData(machineData, schedule);
        
        // Display the schedule
        this.displayMaintenanceSchedule(machineData, schedule);
        
        // Show success message
        this.showSuccessMessage();
        
        // Show the maintenance schedule section
        this.showMaintenanceSection();
    }

    generateMaintenanceSchedule(machineData) {
        const lastServicedDate = new Date(machineData.lastServicedDate);
        const tasks = [];
        
        // Define maintenance tasks
        const maintenanceTasks = [
            { name: 'Check oil levels', priority: 'High', description: 'Inspect and top up oil levels' },
            { name: 'Inspect belts', priority: 'Medium', description: 'Check for wear and proper tension' },
            { name: 'Clean filters', priority: 'Medium', description: 'Replace or clean air/oil filters' }
        ];

        // Calculate days to add based on usage frequency
        const frequencyDays = {
            'daily': 1,
            'weekly': 7,
            'monthly': 30
        };

        const daysToAdd = frequencyDays[machineData.usageFrequency] || 30;

        // Generate tasks with staggered due dates
        maintenanceTasks.forEach((task, index) => {
            const dueDate = new Date(lastServicedDate);
            dueDate.setDate(dueDate.getDate() + (daysToAdd * (index + 1)));
            
            tasks.push({
                id: Date.now() + index,
                name: task.name,
                dueDate: dueDate,
                priority: task.priority,
                status: 'Scheduled',
                description: task.description
            });
        });

        return {
            tasks: tasks,
            aiReminder: this.generateAIReminder(machineData, tasks)
        };
    }

    generateAIReminder(machineData, tasks) {
        const daysSinceService = Math.floor((new Date() - new Date(machineData.lastServicedDate)) / (1000 * 60 * 60 * 24));
        const nextTaskDate = tasks[0].dueDate.toLocaleDateString();
        const machineName = machineData.name.toLowerCase();
        
        // Manufacturing-specific issues based on machine type
        const machineIssues = this.getMachineSpecificIssues(machineName);
        const frequencyWarnings = this.getFrequencySpecificWarnings(machineData.usageFrequency, daysSinceService);
        
        const manufacturingReminders = [
            `⚠️ CRITICAL ALERT: ${machineData.name} operating ${daysSinceService} days since last service. ${machineIssues.primary} Risk of ${machineIssues.consequence} increasing. Schedule maintenance by ${nextTaskDate} to prevent production line shutdown and quality defects.`,
            
            `🔧 PREDICTIVE ANALYSIS: ${machineData.name} shows elevated risk patterns. ${frequencyWarnings.issue} Immediate attention required for ${machineIssues.components}. Delayed maintenance may result in ${machineIssues.costImpact} and compromise ISO quality standards.`,
            
            `📊 MANUFACTURING ALERT: ${machineData.name} approaching critical maintenance threshold. ${machineIssues.vibration} detected. ${frequencyWarnings.production} Schedule maintenance during next planned downtime to avoid emergency repairs costing 3-5x more.`,
            
            `🚨 PRODUCTION RISK: ${machineData.name} requires immediate inspection. ${machineIssues.wear} observed in similar ${machineData.usageFrequency} usage patterns. Failure to maintain by ${nextTaskDate} may cause: ${machineIssues.failures}. Current OEE at risk.`,
            
            `⚙️ MAINTENANCE OPTIMIZATION: ${machineData.name} operating beyond optimal service interval (${daysSinceService} days). ${machineIssues.efficiency} degradation detected. ${frequencyWarnings.recommendation} Proactive maintenance now prevents 40% higher repair costs and part shortages.`
        ];

        return manufacturingReminders[Math.floor(Math.random() * manufacturingReminders.length)];
    }

    // Generate detailed premium checklists for each task
    generatePremiumChecklists() {
        if (!this.currentSchedule) return [];

        const checklists = {
            'Check oil levels': {
                title: 'Oil Level Inspection & Maintenance',
                icon: '🛢️',
                steps: [
                    'Step 1: Power down machine and wait 15 minutes for oil to settle',
                    'Step 2: Check oil viscosity using viscometer (target: SAE 10W-30)',
                    'Step 3: Inspect oil color - should be amber/black, not milky or metallic',
                    'Step 4: Measure oil level using dipstick - maintain between MIN/MAX marks',
                    'Step 5: Check for metal particles using magnetic drain plug inspection',
                    'Step 6: Test oil temperature resistance (operating range: -20°C to 120°C)',
                    'Step 7: Document oil level, viscosity readings, and any contamination found',
                    'Step 8: Top up with manufacturer-specified oil grade if below minimum'
                ],
                safetyNotes: 'Wear safety gloves and eye protection. Ensure proper ventilation.',
                estimatedTime: '25-30 minutes',
                tools: 'Dipstick, viscometer, funnel, oil sampling kit, safety equipment'
            },
            'Inspect belts': {
                title: 'Drive Belt Inspection & Tensioning',
                icon: '⚙️',
                steps: [
                    'Step 1: Power off machine and engage lockout/tagout procedures',
                    'Step 2: Visually inspect belt for cracks, fraying, or glazing on surface',
                    'Step 3: Check belt alignment using laser alignment tool or straight edge',
                    'Step 4: Measure belt tension using tension gauge (target: 140-160 Hz frequency)',
                    'Step 5: Inspect pulley grooves for wear, debris, or damage',
                    'Step 6: Check belt width consistency - should not vary more than 1mm',
                    'Step 7: Test belt flexibility - should bend without cracking',
                    'Step 8: Adjust tensioners to manufacturer specifications if needed',
                    'Step 9: Apply belt dressing if authorized by manufacturer'
                ],
                safetyNotes: 'Never attempt belt inspection while machine is running. Use proper lockout procedures.',
                estimatedTime: '35-45 minutes',
                tools: 'Belt tension gauge, laser alignment tool, straight edge, lockout kit'
            },
            'Clean filters': {
                title: 'Air & Oil Filter Maintenance',
                icon: '🌪️',
                steps: [
                    'Step 1: Shut down system and depressurize all air lines',
                    'Step 2: Remove air filter housing cover using appropriate tools',
                    'Step 3: Inspect filter element for dirt loading - replace if >80% clogged',
                    'Step 4: Clean reusable filters with compressed air (max 30 PSI)',
                    'Step 5: Check filter housing gaskets and seals for integrity',
                    'Step 6: Measure pressure differential across filter (max 2.5 PSI drop)',
                    'Step 7: Install new filter with proper orientation (airflow direction)',
                    'Step 8: Apply thin layer of filter oil to foam pre-filters if equipped',
                    'Step 9: Reassemble housing ensuring proper gasket placement',
                    'Step 10: Test system pressure and check for air leaks'
                ],
                safetyNotes: 'Wear dust mask when handling dirty filters. Dispose of filters per environmental regulations.',
                estimatedTime: '20-25 minutes',
                tools: 'Filter wrenches, compressed air gun, pressure gauge, replacement filters'
            }
        };

        return this.currentSchedule.schedule.tasks.map(task => ({
            taskName: task.name,
            checklist: checklists[task.name] || null
        })).filter(item => item.checklist !== null);
    }

    // Toggle premium checklists
    togglePremiumChecklists() {
        const toggle = document.getElementById('premiumToggle');
        const checklistsContainer = document.getElementById('premiumChecklists');

        if (toggle.checked) {
            if (!this.isPremiumUser) {
                // Show upgrade alert for non-premium users
                this.showUpgradeAlert();
                toggle.checked = false; // Reset toggle
                return;
            }

            // Show premium checklists for premium users
            const checklists = this.generatePremiumChecklists();
            this.displayPremiumChecklists(checklists);
            checklistsContainer.classList.remove('hidden');
        } else {
            checklistsContainer.classList.add('hidden');
        }
    }

    // Display premium checklists
    displayPremiumChecklists(checklists) {
        const container = document.getElementById('premiumChecklists');
        
        const checklistsHTML = checklists.map(item => `
            <div class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 overflow-hidden">
                <div class="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
                    <h5 class="text-lg font-semibold text-white flex items-center">
                        <span class="text-2xl mr-3">${item.checklist.icon}</span>
                        ${item.checklist.title}
                    </h5>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <div class="bg-white rounded-lg p-4 border border-gray-200">
                            <h6 class="font-semibold text-gray-700 mb-2">⏱️ Estimated Time</h6>
                            <p class="text-gray-600">${item.checklist.estimatedTime}</p>
                        </div>
                        <div class="bg-white rounded-lg p-4 border border-gray-200">
                            <h6 class="font-semibold text-gray-700 mb-2">🔧 Required Tools</h6>
                            <p class="text-gray-600 text-sm">${item.checklist.tools}</p>
                        </div>
                        <div class="bg-white rounded-lg p-4 border border-red-200 bg-red-50">
                            <h6 class="font-semibold text-red-700 mb-2">⚠️ Safety Notes</h6>
                            <p class="text-red-600 text-sm">${item.checklist.safetyNotes}</p>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg p-4 border border-gray-200">
                        <h6 class="font-semibold text-gray-700 mb-4">📋 Detailed Checklist</h6>
                        <div class="space-y-3">
                            ${item.checklist.steps.map((step, index) => `
                                <div class="flex items-start space-x-3">
                                    <div class="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-semibold text-purple-600 mt-0.5">
                                        ${index + 1}
                                    </div>
                                    <div class="flex-1">
                                        <p class="text-gray-700">${step}</p>
                                    </div>
                                    <input type="checkbox" class="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 focus:ring-2 mt-1">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = checklistsHTML;
    }

    // Show upgrade alert for non-premium users
    showUpgradeAlert() {
        const alertHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="upgradeAlert">
                <div class="bg-white rounded-2xl shadow-2xl max-w-md mx-4 overflow-hidden">
                    <div class="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
                        <h3 class="text-xl font-bold text-white flex items-center">
                            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                            Upgrade to Premium
                        </h3>
                    </div>
                    <div class="p-6">
                        <div class="text-center mb-6">
                            <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                                </svg>
                            </div>
                            <h4 class="text-lg font-semibold text-gray-900 mb-2">Premium Feature Required</h4>
                            <p class="text-gray-600 mb-4">Unlock detailed step-by-step maintenance checklists with premium access.</p>
                        </div>
                        
                        <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 mb-6">
                            <h5 class="font-semibold text-amber-900 mb-2">Premium Features Include:</h5>
                            <ul class="text-amber-800 text-sm space-y-1">
                                <li>✓ Detailed step-by-step maintenance procedures</li>
                                <li>✓ Safety guidelines and tool requirements</li>
                                <li>✓ Time estimates for each task</li>
                                <li>✓ Interactive checklists with progress tracking</li>
                                <li>✓ Advanced AI maintenance recommendations</li>
                            </ul>
                        </div>
                        
                        <div class="flex space-x-3">
                            <button onclick="closeUpgradeAlert()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition duration-200">
                                Maybe Later
                            </button>
                            <button onclick="simulateUpgrade()" class="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
                                Upgrade Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', alertHTML);
    }

    getMachineSpecificIssues(machineName) {
        // Default issues for different machine types
        const defaultIssues = {
            primary: "Lubrication system degradation and bearing wear",
            consequence: "catastrophic bearing failure and spindle damage",
            components: "drive belts, filtration systems, and hydraulic seals",
            costImpact: "$15,000-50,000 in emergency repairs",
            vibration: "Abnormal vibration patterns and noise levels",
            wear: "Accelerated component wear and misalignment",
            failures: "unplanned downtime (8-12 hours), scrap production, safety hazards",
            efficiency: "15-25% performance and energy"
        };

        // Machine-specific issues based on machine name keywords
        if (machineName.includes('cnc') || machineName.includes('mill') || machineName.includes('lathe')) {
            return {
                primary: "Spindle bearing deterioration and coolant contamination",
                consequence: "spindle failure and precision loss (±0.001\")",
                components: "tool changers, spindle assemblies, and coolant systems",
                costImpact: "$25,000-75,000 in spindle replacement",
                vibration: "Spindle vibration exceeding 0.5mm/s threshold",
                wear: "Tool holder taper wear and chuck jaw deterioration",
                failures: "dimensional accuracy loss, surface finish defects, automatic tool changer jamming",
                efficiency: "20-30% cutting speed and precision"
            };
        } else if (machineName.includes('press') || machineName.includes('stamp') || machineName.includes('punch')) {
            return {
                primary: "Hydraulic pressure fluctuations and die wear patterns",
                consequence: "press tonnage loss and part quality deviation",
                components: "hydraulic cylinders, pressure sensors, and die sets",
                costImpact: "$10,000-40,000 in hydraulic system repair",
                vibration: "Frame vibration and tonnage inconsistency",
                wear: "Die wear exceeding 0.002\" tolerance and guide bushing play",
                failures: "part dimensional variance, die cracking, hydraulic seal rupture",
                efficiency: "10-20% cycle time and tonnage"
            };
        } else if (machineName.includes('weld') || machineName.includes('robot')) {
            return {
                primary: "Arc stability degradation and robot positioning drift",
                consequence: "weld penetration inconsistency and joint failure",
                components: "welding cables, robot encoders, and gas delivery systems",
                costImpact: "$8,000-30,000 in robot recalibration",
                vibration: "Robot arm oscillation and torch positioning error",
                wear: "Contact tip deterioration and cable flexibility loss",
                failures: "weld defects (porosity, underfill), robot crash events, gas flow interruption",
                efficiency: "25-35% welding speed and quality"
            };
        } else if (machineName.includes('pump') || machineName.includes('compressor') || machineName.includes('motor')) {
            return {
                primary: "Motor bearing degradation and impeller wear",
                consequence: "pump cavitation and system pressure loss",
                components: "mechanical seals, impellers, and motor windings",
                costImpact: "$5,000-25,000 in pump rebuild",
                vibration: "Bearing vibration exceeding ISO 10816 standards",
                wear: "Impeller erosion and seal face deterioration",
                failures: "system pressure drop, fluid contamination, motor burnout",
                efficiency: "15-25% flow rate and energy"
            };
        } else if (machineName.includes('conveyor') || machineName.includes('belt')) {
            return {
                primary: "Belt tension degradation and roller bearing wear",
                consequence: "material handling disruption and belt slippage",
                components: "drive rollers, belt tensioners, and motor couplings",
                costImpact: "$3,000-15,000 in conveyor rebuild",
                vibration: "Roller wobble and belt tracking issues",
                wear: "Belt edge fraying and roller surface wear",
                failures: "material spillage, belt breakage, production line stoppage",
                efficiency: "10-15% throughput and reliability"
            };
        }

        return defaultIssues;
    }

    getFrequencySpecificWarnings(frequency, daysSinceService) {
        switch (frequency) {
            case 'daily':
                return {
                    issue: "High-duty cycle operation accelerating component fatigue.",
                    production: "Continuous operation requires immediate intervention.",
                    recommendation: "24/7 operation demands predictive maintenance protocols."
                };
            case 'weekly':
                return {
                    issue: `Regular operation (${daysSinceService} days) showing normal wear progression.`,
                    production: "Weekly production cycles allow maintenance window flexibility.",
                    recommendation: "Moderate usage permits scheduled maintenance optimization."
                };
            case 'monthly':
                return {
                    issue: "Intermittent operation may cause seal drying and lubrication issues.",
                    production: "Low utilization requires attention to standby deterioration.",
                    recommendation: "Periodic operation needs preservation maintenance focus."
                };
            default:
                return {
                    issue: "Usage pattern analysis incomplete.",
                    production: "Production schedule requires maintenance coordination.",
                    recommendation: "Standard maintenance protocols recommended."
                };
        }
    }

    // Export schedule as PDF
    exportAsPDF() {
        if (!this.currentSchedule) {
            this.showNotification('No schedule to export. Please generate a schedule first.', 'error');
            return;
        }

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // PDF styling constants
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 20;
            let currentY = margin;
            
            // Helper function to add text with word wrapping
            const addWrappedText = (text, x, y, maxWidth, fontSize = 12) => {
                doc.setFontSize(fontSize);
                const lines = doc.splitTextToSize(text, maxWidth);
                doc.text(lines, x, y);
                return y + (lines.length * fontSize * 0.5);
            };

            // Header
            doc.setFillColor(59, 130, 246); // Blue background
            doc.rect(0, 0, pageWidth, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont(undefined, 'bold');
            doc.text('AI MAINTENANCE SCHEDULER', pageWidth / 2, 25, { align: 'center' });
            
            currentY = 60;

            // Machine Information Section
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(18);
            doc.setFont(undefined, 'bold');
            doc.text('Machine Information', margin, currentY);
            currentY += 15;

            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            
            const machineInfo = [
                `Machine Name: ${this.currentSchedule.machineData.name}`,
                `Last Serviced: ${new Date(this.currentSchedule.machineData.lastServicedDate).toLocaleDateString()}`,
                `Usage Frequency: ${this.currentSchedule.machineData.usageFrequency.charAt(0).toUpperCase() + this.currentSchedule.machineData.usageFrequency.slice(1)}`,
                `Report Generated: ${new Date(this.currentSchedule.generatedAt).toLocaleDateString()}`
            ];

            machineInfo.forEach(info => {
                doc.text(info, margin, currentY);
                currentY += 8;
            });

            currentY += 10;

            // AI Reminder Section
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text('AI Maintenance Recommendation', margin, currentY);
            currentY += 15;

            // Add blue border for AI reminder
            doc.setDrawColor(59, 130, 246);
            doc.setLineWidth(1);
            const reminderHeight = 40;
            doc.rect(margin, currentY - 5, pageWidth - 2 * margin, reminderHeight);

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            // Clean the reminder text (remove emojis and HTML)
            const cleanReminder = this.currentSchedule.schedule.aiReminder
                .replace(/[⚠️🔧📊🚨⚙️]/g, '') // Remove emojis
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .trim();
            
            currentY = addWrappedText(cleanReminder, margin + 5, currentY + 5, pageWidth - 2 * margin - 10, 10);
            currentY += 20;

            // Maintenance Tasks Section
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text('Scheduled Maintenance Tasks', margin, currentY);
            currentY += 15;

            // Table headers
            const tableStartY = currentY;
            const colWidths = [60, 40, 30, 30];
            const colPositions = [margin, margin + colWidths[0], margin + colWidths[0] + colWidths[1], margin + colWidths[0] + colWidths[1] + colWidths[2]];
            
            // Header background
            doc.setFillColor(249, 250, 251);
            doc.rect(margin, currentY - 5, pageWidth - 2 * margin, 15, 'F');
            
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            const headers = ['Task Name', 'Due Date', 'Priority', 'Status'];
            headers.forEach((header, index) => {
                doc.text(header, colPositions[index], currentY + 5);
            });
            
            currentY += 20;

            // Table rows
            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            
            this.currentSchedule.schedule.tasks.forEach((task, index) => {
                // Alternate row background
                if (index % 2 === 0) {
                    doc.setFillColor(248, 249, 250);
                    doc.rect(margin, currentY - 5, pageWidth - 2 * margin, 15, 'F');
                }

                const rowData = [
                    task.name,
                    task.dueDate.toLocaleDateString(),
                    task.priority,
                    task.status
                ];

                rowData.forEach((data, colIndex) => {
                    doc.text(data.toString(), colPositions[colIndex], currentY + 5);
                });

                currentY += 15;
            });

            // Footer
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(`Generated by AI Maintenance Scheduler on ${new Date().toLocaleDateString()}`, 
                    pageWidth / 2, pageHeight - 10, { align: 'center' });

            // Add page border
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.5);
            doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

            // Save the PDF
            const fileName = `${this.currentSchedule.machineData.name}-maintenance-schedule.pdf`;
            doc.save(fileName);
            
            this.showNotification(`PDF exported successfully as ${fileName}!`, 'success');

        } catch (error) {
            console.error('PDF Export Error:', error);
            this.showNotification('Error generating PDF. Please try again.', 'error');
        }
    }

    createTaskRow(task) {
        const dueDate = task.dueDate.toLocaleDateString();
        const isOverdue = task.dueDate < new Date();
        const statusClass = isOverdue ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50';
        const priorityClass = this.getPriorityClass(task.priority);
        
        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                    <div class="flex flex-col">
                        <div class="text-sm font-medium text-gray-900">${task.name}</div>
                        <div class="text-sm text-gray-500">${task.description}</div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">${dueDate}</div>
                    ${isOverdue ? '<div class="text-xs text-red-600 font-medium">Overdue</div>' : ''}
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityClass}">
                        ${task.priority}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
                        ${isOverdue ? 'Overdue' : task.status}
                    </span>
                </td>
            </tr>
        `;
    }

    displayMaintenanceSchedule(machineData, schedule) {
        // Update AI reminder
        const aiReminderElement = document.getElementById('aiReminder');
        if (aiReminderElement) {
            aiReminderElement.innerHTML = schedule.aiReminder; // Using innerHTML to support emojis and formatting
        }

        // Populate tasks table
        const tableBody = document.getElementById('maintenanceTasksTable');
        if (tableBody) {
            tableBody.innerHTML = schedule.tasks.map(task => this.createTaskRow(task)).join('');
        }
    }

    // Save current schedule to localStorage
    saveCurrentSchedule() {
        if (!this.currentSchedule) {
            this.showNotification('No schedule to save. Please generate a schedule first.', 'error');
            return;
        }

        const scheduleToSave = {
            id: Date.now().toString(),
            machineName: this.currentSchedule.machineData.name,
            lastServicedDate: this.currentSchedule.machineData.lastServicedDate,
            usageFrequency: this.currentSchedule.machineData.usageFrequency,
            tasks: this.currentSchedule.schedule.tasks.map(task => ({
                ...task,
                dueDate: task.dueDate.toISOString() // Convert date to string for storage
            })),
            aiReminder: this.currentSchedule.schedule.aiReminder,
            savedAt: new Date().toISOString(),
            generatedAt: this.currentSchedule.generatedAt
        };

        this.savedSchedules.push(scheduleToSave);
        localStorage.setItem('savedSchedules', JSON.stringify(this.savedSchedules));
        
        this.showNotification(`Schedule for ${scheduleToSave.machineName} saved successfully!`, 'success');
        
        // Update the save button to show it's been saved
        const saveBtn = document.getElementById('saveScheduleBtn');
        if (saveBtn) {
            saveBtn.innerHTML = `
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Saved!
            `;
            saveBtn.classList.remove('bg-emerald-600', 'hover:bg-emerald-700');
            saveBtn.classList.add('bg-green-600', 'hover:bg-green-700');
            
            // Reset button after 2 seconds
            setTimeout(() => {
                saveBtn.innerHTML = `
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                    </svg>
                    Save Schedule
                `;
                saveBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
                saveBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
            }, 2000);
        }
    }

    // Display saved schedules
    displaySavedSchedules() {
        const savedSchedulesSection = document.getElementById('savedSchedulesSection');
        const savedSchedulesList = document.getElementById('savedSchedulesList');
        
        if (this.savedSchedules.length === 0) {
            savedSchedulesList.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                    <p class="text-lg font-medium mb-2">No saved schedules yet</p>
                    <p>Generate and save maintenance schedules to view them here.</p>
                </div>
            `;
        } else {
            savedSchedulesList.innerHTML = this.savedSchedules.map(schedule => this.createSavedScheduleCard(schedule)).join('');
        }
        
        if (savedSchedulesSection) {
            savedSchedulesSection.classList.remove('hidden');
        }
    }

    createSavedScheduleCard(schedule) {
        const savedDate = new Date(schedule.savedAt).toLocaleDateString();
        const taskCount = schedule.tasks.length;
        const upcomingTask = schedule.tasks.find(task => new Date(task.dueDate) > new Date());
        const nextDueDate = upcomingTask ? new Date(upcomingTask.dueDate).toLocaleDateString() : 'No upcoming tasks';
        
        return `
            <div class="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-gray-300 transition-colors">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <h4 class="text-lg font-semibold text-gray-900 mb-2">${schedule.machineName}</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                                <span class="font-medium">Usage:</span> ${schedule.usageFrequency.charAt(0).toUpperCase() + schedule.usageFrequency.slice(1)}
                            </div>
                            <div>
                                <span class="font-medium">Tasks:</span> ${taskCount}
                            </div>
                            <div>
                                <span class="font-medium">Next Due:</span> ${nextDueDate}
                            </div>
                        </div>
                        <div class="mt-2 text-xs text-gray-500">
                            Saved on ${savedDate}
                        </div>
                    </div>
                    <div class="flex gap-2 ml-4">
                        <button onclick="machineScheduler.loadSavedSchedule('${schedule.id}')" 
                                class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors">
                            Load
                        </button>
                        <button onclick="machineScheduler.deleteSavedSchedule('${schedule.id}')" 
                                class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors">
                            Delete
                        </button>
                    </div>
                </div>
                <div class="bg-white rounded p-3 text-sm">
                    <div class="text-gray-600 mb-1">AI Reminder:</div>
                    <div class="text-gray-800 line-clamp-2">${schedule.aiReminder.substring(0, 150)}${schedule.aiReminder.length > 150 ? '...' : ''}</div>
                </div>
            </div>
        `;
    }

    // Load a saved schedule
    loadSavedSchedule(scheduleId) {
        const schedule = this.savedSchedules.find(s => s.id === scheduleId);
        if (!schedule) {
            this.showNotification('Schedule not found.', 'error');
            return;
        }

        // Convert date strings back to Date objects
        const scheduleWithDates = {
            ...schedule,
            tasks: schedule.tasks.map(task => ({
                ...task,
                dueDate: new Date(task.dueDate)
            }))
        };

        // Set current schedule
        this.currentSchedule = {
            machineData: {
                name: schedule.machineName,
                lastServicedDate: schedule.lastServicedDate,
                usageFrequency: schedule.usageFrequency
            },
            schedule: {
                tasks: scheduleWithDates.tasks,
                aiReminder: schedule.aiReminder
            },
            generatedAt: schedule.generatedAt
        };

        // Display the schedule
        this.displayMaintenanceSchedule(this.currentSchedule.machineData, this.currentSchedule.schedule);
        this.showMaintenanceSection();
        
        // Hide saved schedules section
        document.getElementById('savedSchedulesSection').classList.add('hidden');
        
        this.showNotification(`Schedule for ${schedule.machineName} loaded successfully!`, 'success');
    }

    // Delete a saved schedule
    deleteSavedSchedule(scheduleId) {
        const schedule = this.savedSchedules.find(s => s.id === scheduleId);
        if (!schedule) return;

        if (confirm(`Are you sure you want to delete the schedule for ${schedule.machineName}?`)) {
            this.savedSchedules = this.savedSchedules.filter(s => s.id !== scheduleId);
            localStorage.setItem('savedSchedules', JSON.stringify(this.savedSchedules));
            this.displaySavedSchedules();
            this.showNotification('Schedule deleted successfully!', 'success');
        }
    }

    getPriorityClass(priority) {
        const classes = {
            'High': 'bg-red-100 text-red-800',
            'Medium': 'bg-yellow-100 text-yellow-800',
            'Low': 'bg-green-100 text-green-800'
        };
        return classes[priority] || 'bg-gray-100 text-gray-800';
    }

    saveMachineData(machineData, schedule) {
        const machine = {
            id: Date.now().toString(),
            ...machineData,
            schedule: schedule,
            createdAt: new Date().toISOString()
        };
        
        this.machines.push(machine);
        localStorage.setItem('machines', JSON.stringify(this.machines));
    }

    showSuccessMessage() {
        const successMessage = document.getElementById('successMessage');
        if (successMessage) {
            successMessage.classList.remove('hidden');
            successMessage.classList.add('fade-in');
            
            // Hide after 3 seconds
            setTimeout(() => {
                successMessage.classList.add('hidden');
                successMessage.classList.remove('fade-in');
            }, 3000);
        }
    }

    showMaintenanceSection() {
        const maintenanceSection = document.getElementById('maintenanceSchedule');
        if (maintenanceSection) {
            // Small delay for better UX
            setTimeout(() => {
                maintenanceSection.classList.remove('hidden');
                maintenanceSection.classList.add('slide-in');
                
                // Smooth scroll to the section
                maintenanceSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 500);
        }
    }

    // Export functionality (JSON)
    exportMaintenanceSchedule() {
        if (!this.currentSchedule) {
            this.showNotification('No schedule to export. Please generate a schedule first.', 'error');
            return;
        }

        const exportData = {
            machine: this.currentSchedule.machineData.name,
            lastServiced: this.currentSchedule.machineData.lastServicedDate,
            usageFrequency: this.currentSchedule.machineData.usageFrequency,
            generatedOn: this.currentSchedule.generatedAt,
            tasks: this.currentSchedule.schedule.tasks.map(task => ({
                name: task.name,
                dueDate: task.dueDate.toISOString(),
                priority: task.priority,
                status: task.status,
                description: task.description
            })),
            aiReminder: this.currentSchedule.schedule.aiReminder
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.currentSchedule.machineData.name}-maintenance-schedule.json`;
        link.click();
        URL.revokeObjectURL(url);

        this.showNotification('JSON schedule exported successfully!', 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 transform shadow-lg ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 
            'bg-blue-500'
        }`;
        notification.textContent = message;
        notification.style.transform = 'translateX(100%)';

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // Reset form and hide schedule
    resetForm() {
        const form = document.getElementById('machineForm');
        const scheduleSection = document.getElementById('maintenanceSchedule');
        const successMessage = document.getElementById('successMessage');
        
        if (form) form.reset();
        if (scheduleSection) scheduleSection.classList.add('hidden');
        if (successMessage) successMessage.classList.add('hidden');
        
        this.currentSchedule = null;
        this.showNotification('Form reset successfully', 'success');
    }
}

// Initialize the application
const machineScheduler = new MachineMaintenanceScheduler();

// Global functions for button actions
function exportSchedule() {
    machineScheduler.exportMaintenanceSchedule();
}

function exportAsPDF() {
    machineScheduler.exportAsPDF();
}

function saveCurrentSchedule() {
    machineScheduler.saveCurrentSchedule();
}

function viewSavedSchedules() {
    machineScheduler.displaySavedSchedules();
}

function setReminders() {
    // Future implementation for setting calendar reminders
    machineScheduler.showNotification('Reminder feature coming soon!', 'info');
}

function resetApplication() {
    machineScheduler.resetForm();
}

// Premium checklists functions
function togglePremiumChecklists() {
    machineScheduler.togglePremiumChecklists();
}

function closeUpgradeAlert() {
    const alert = document.getElementById('upgradeAlert');
    if (alert) {
        alert.remove();
    }
}

function simulateUpgrade() {
    // Simulate premium upgrade
    machineScheduler.isPremiumUser = true;
    closeUpgradeAlert();
    
    // Enable the toggle and show checklists
    const toggle = document.getElementById('premiumToggle');
    toggle.checked = true;
    machineScheduler.togglePremiumChecklists();
    
    machineScheduler.showNotification('🎉 Congratulations! You now have premium access to detailed checklists!', 'success');
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to submit form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        const form = document.getElementById('machineForm');
        if (form) {
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) submitButton.click();
        }
    }
    
    // Ctrl/Cmd + S to save schedule
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        machineScheduler.saveCurrentSchedule();
    }
    
    // Ctrl/Cmd + P to export PDF
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        machineScheduler.exportAsPDF();
    }
    
    // Ctrl/Cmd + R to reset form
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        machineScheduler.resetForm();
    }
    
    // Ctrl/Cmd + E to export JSON
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        machineScheduler.exportMaintenanceSchedule();
    }
    
    // Ctrl/Cmd + V to view saved schedules
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        machineScheduler.displaySavedSchedules();
    }
});

// Auto-save form data as user types (optional feature)
document.addEventListener('DOMContentLoaded', () => {
    const formInputs = document.querySelectorAll('#machineForm input, #machineForm select');
    
    formInputs.forEach(input => {
        input.addEventListener('input', () => {
            const formData = new FormData(document.getElementById('machineForm'));
            const draftData = {};
            for (let [key, value] of formData.entries()) {
                if (value) draftData[key] = value;
            }
            localStorage.setItem('formDraft', JSON.stringify(draftData));
        });
    });

    // Restore draft data on page load
    const draftData = localStorage.getItem('formDraft');
    if (draftData) {
        const data = JSON.parse(draftData);
        Object.keys(data).forEach(key => {
            const input = document.querySelector(`[name="${key}"]`);
            if (input) input.value = data[key];
        });
    }
});

// Clear draft data when form is successfully submitted
document.getElementById('machineForm')?.addEventListener('submit', () => {
    localStorage.removeItem('formDraft');
});

console.log('Machine Maintenance Scheduler initialized successfully!');
