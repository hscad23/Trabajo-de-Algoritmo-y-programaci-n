document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let simulationHistory = [];
    let simCounter = 0;


    // --- Elements ---
    const btnSimulate = document.getElementById('btn-simulate');
    const btnStop = document.getElementById('btn-stop');
    const loader = document.querySelector('.loader');
    const btnText = document.querySelector('.btn-text');

    // Sliders & Inputs sync
    const ratioSlider = document.getElementById('compression_ratio_slider');
    const ratioInput = document.getElementById('compression_ratio');

    ratioSlider.addEventListener('input', (e) => ratioInput.value = e.target.value);
    ratioInput.addEventListener('input', (e) => ratioSlider.value = e.target.value);

    // --- Chart Setup ---
    const ctx = document.getElementById('pvChart').getContext('2d');

    // Gradient for chart
    const gradientFill = ctx.createLinearGradient(0, 0, 0, 400);
    gradientFill.addColorStop(0, 'rgba(0, 229, 255, 0.4)');
    gradientFill.addColorStop(1, 'rgba(0, 229, 255, 0.0)');

    const pvChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Ciclo Otto',
                data: [], // Array of {x: vol, y: pres}
                borderColor: '#00e5ff',
                backgroundColor: gradientFill,
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            scales: {
                x: {
                    type: 'linear',
                    title: { display: true, text: 'Volumen (m³)', color: '#8b949e', font: { size: 16 } },
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#8b949e', font: { size: 14 } }
                },
                y: {
                    title: { display: true, text: 'Presión (Pa)', color: '#8b949e', font: { size: 16 } },
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#8b949e', font: { size: 14 } }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 17, 21, 0.9)',
                    titleColor: '#00e5ff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(0, 229, 255, 0.3)',
                    borderWidth: 1
                }
            }
        }
    });

    // --- Engine Animation Setup ---
    const canvas = document.getElementById('engineSimCanvas');
    const ectx = canvas.getContext('2d');

    // Animation state
    let angle = 0;
    let isAnimating = false;
    let animRequest;

    function drawEngine(theta) {
        // Clear canvas
        ectx.clearRect(0, 0, canvas.width, canvas.height);

        const w = canvas.width;
        const h = canvas.height;

        // Parameters for drawing
        const cylW = 90;
        const strokeLen = 100;
        const cylH = 140 + strokeLen;
        const cylX = w / 2 - cylW / 2;
        const cylY = 47; // Posición elevada en 3px (antes era 50)

        const r = strokeLen / 2;
        const l = strokeLen * 1.5; // connecting rod length
        const cx = w / 2;
        const cy = cylY + cylH + r + 20; // Crank center

        // Calculate piston position
        const crankX = cx + r * Math.sin(theta);
        const crankY = cy - r * Math.cos(theta);

        // Math to find piston Y
        const dx = cx - crankX; // which is -r*sin(theta)
        const dL = Math.sqrt(l * l - dx * dx);
        const pistonY = crankY - dL;
        const pistonH = 45;

        // Colors based on stroke (0 to 4pi)
        let strokeStage = "";
        let gasColor = "rgba(0,0,0,0)";
        let intakeOpen = false;
        let exhaustOpen = false;
        let spark = false;

        const normalizedTheta = theta % (4 * Math.PI);
        if (normalizedTheta < Math.PI) {
            strokeStage = "Admisión";
            gasColor = `rgba(0, 200, 255, ${0.1 + (normalizedTheta / Math.PI) * 0.3})`;
            intakeOpen = true;
        } else if (normalizedTheta < 2 * Math.PI) {
            strokeStage = "Compresión";
            const progress = (normalizedTheta - Math.PI) / Math.PI;
            gasColor = `rgba(${progress * 255}, ${200 - progress * 100}, ${255 - progress * 255}, ${0.4 + progress * 0.4})`;
        } else if (normalizedTheta < 3 * Math.PI) {
            strokeStage = "Expansión";
            const progress = (normalizedTheta - 2 * Math.PI) / Math.PI;
            gasColor = `rgba(255, ${150 - progress * 100}, 0, ${0.8 - progress * 0.5})`;
            if (progress < 0.15) spark = true;
        } else {
            strokeStage = "Escape";
            const progress = (normalizedTheta - 3 * Math.PI) / Math.PI;
            gasColor = `rgba(150, 150, 150, ${0.5 - progress * 0.3})`;
            exhaustOpen = true;
        }

        document.getElementById('hud-stage').innerText = strokeStage;
        document.getElementById('hud-angle').innerText = `${Math.floor((normalizedTheta * 180 / Math.PI)) % 720}°`;

        // Engine Block Background / Cooling fins
        ectx.fillStyle = '#1e293b';
        for (let i = 0; i < 6; i++) {
            ectx.fillRect(cylX - 15, cylY + 30 + i * 25, cylW + 30, 10);
        }

        // Draw Gas
        ectx.fillStyle = gasColor;
        ectx.fillRect(cylX, cylY, cylW, pistonY - cylY);

        // Draw Sparks
        if (spark) {
            ectx.fillStyle = '#fff';
            ectx.beginPath();
            ectx.arc(cx, cylY + 15, 12, 0, Math.PI * 2);
            ectx.fill();
            ectx.fillStyle = '#ffff00';
            ectx.beginPath();
            ectx.arc(cx, cylY + 15, 8, 0, Math.PI * 2);
            ectx.fill();
        }

        // Draw Cylinder
        ectx.strokeStyle = '#94a3b8';
        ectx.lineWidth = 6;
        ectx.beginPath();
        ectx.moveTo(cylX, cylY);
        ectx.lineTo(cylX, cylY + cylH);
        ectx.moveTo(cylX + cylW, cylY);
        ectx.lineTo(cylX + cylW, cylY + cylH);
        ectx.stroke();

        // Cylinder Head with valve ports
        ectx.beginPath();
        ectx.moveTo(cylX - 10, cylY);
        ectx.lineTo(cx - 15, cylY);
        ectx.moveTo(cx + 15, cylY);
        ectx.lineTo(cylX + cylW + 10, cylY);
        ectx.stroke();

        // Draw Spark Plug
        ectx.fillStyle = '#e2e8f0';
        ectx.fillRect(cx - 6, cylY - 15, 12, 20);
        ectx.fillStyle = '#64748b';
        ectx.fillRect(cx - 2, cylY + 5, 4, 8);

        // Draw Valves
        const valveRadius = 10;
        const intakeValveY = cylY + (intakeOpen ? 12 : 2);
        const exhaustValveY = cylY + (exhaustOpen ? 12 : 2);

        // Intake Valve
        ectx.fillStyle = '#cbd5e1';
        ectx.beginPath();
        ectx.moveTo(cx - 20, cylY - 15);
        ectx.lineTo(cx - 20, intakeValveY);
        ectx.lineWidth = 3;
        ectx.stroke();
        ectx.beginPath();
        ectx.ellipse(cx - 20, intakeValveY, valveRadius, 3, 0, 0, Math.PI * 2);
        ectx.fill();

        // Exhaust Valve
        ectx.beginPath();
        ectx.moveTo(cx + 20, cylY - 15);
        ectx.lineTo(cx + 20, exhaustValveY);
        ectx.stroke();
        ectx.beginPath();
        ectx.ellipse(cx + 20, exhaustValveY, valveRadius, 3, 0, 0, Math.PI * 2);
        ectx.fill();

        // Draw Piston
        const pistonGradient = ectx.createLinearGradient(cylX, 0, cylX + cylW, 0);
        pistonGradient.addColorStop(0, '#64748b');
        pistonGradient.addColorStop(0.5, '#94a3b8');
        pistonGradient.addColorStop(1, '#475569');
        ectx.fillStyle = pistonGradient;

        // Piston Body
        ectx.fillRect(cylX + 3, pistonY, cylW - 6, pistonH);

        // Piston Rings
        ectx.fillStyle = '#1e293b';
        ectx.fillRect(cylX + 3, pistonY + 5, cylW - 6, 3);
        ectx.fillRect(cylX + 3, pistonY + 12, cylW - 6, 3);
        ectx.fillRect(cylX + 3, pistonY + 19, cylW - 6, 3);

        // Wrist Pin
        ectx.fillStyle = '#0f172a';
        ectx.beginPath();
        ectx.arc(cx, pistonY + 25, 6, 0, Math.PI * 2);
        ectx.fill();

        // Draw Connecting Rod
        ectx.strokeStyle = '#cbd5e1';
        ectx.lineWidth = 10;
        ectx.lineCap = 'round';
        ectx.beginPath();
        ectx.moveTo(cx, pistonY + 25);
        ectx.lineTo(crankX, crankY);
        ectx.stroke();

        // Connecting rod inner line for detail
        ectx.strokeStyle = '#94a3b8';
        ectx.lineWidth = 4;
        ectx.beginPath();
        ectx.moveTo(cx, pistonY + 25);
        ectx.lineTo(crankX, crankY);
        ectx.stroke();

        // Draw Crankcase / Crank circle path
        ectx.strokeStyle = 'rgba(255,255,255,0.05)';
        ectx.lineWidth = 1;
        ectx.beginPath();
        ectx.arc(cx, cy, r + 15, 0, Math.PI * 2);
        ectx.stroke();
        ectx.setLineDash([5, 5]);
        ectx.beginPath();
        ectx.arc(cx, cy, r, 0, Math.PI * 2);
        ectx.stroke();
        ectx.setLineDash([]);

        // Draw Crank web
        ectx.fillStyle = '#475569';
        ectx.beginPath();
        ectx.arc(cx, cy, 25, 0, Math.PI * 2);
        ectx.fill();

        // Draw Crank arm
        ectx.strokeStyle = '#64748b';
        ectx.lineWidth = 16;
        ectx.lineCap = 'round';
        ectx.beginPath();
        ectx.moveTo(cx, cy);
        ectx.lineTo(crankX, crankY);
        ectx.stroke();

        // Crank center joint
        ectx.fillStyle = '#ff3366';
        ectx.beginPath();
        ectx.arc(cx, cy, 8, 0, Math.PI * 2);
        ectx.fill();

        // Crankpin joint
        ectx.fillStyle = '#00e5ff';
        ectx.beginPath();
        ectx.arc(crankX, crankY, 6, 0, Math.PI * 2);
        ectx.fill();
    }

    // Initial draw
    drawEngine(0);

    function animateEngine() {
        if (!isAnimating) return;
        angle += 0.1; // speed
        if (angle >= 4 * Math.PI) angle = 0;
        drawEngine(angle);
        animRequest = requestAnimationFrame(animateEngine);
    }

    // --- Simulation Trigger ---
    btnSimulate.addEventListener('click', async () => {
        // UI Loading State
        btnText.classList.add('hidden');
        loader.classList.remove('hidden');
        btnSimulate.disabled = true;

        try {
            // Gather parameters
            const r = document.getElementById('compression_ratio').value;
            const rpm = document.getElementById('rpm').value;

            const stroke = document.getElementById('stroke').value;
            const bore = document.getElementById('bore').value;

            // Verificar si los parámetros son idénticos a la última simulación
            if (simulationHistory.length > 0) {
                const lastSim = simulationHistory[simulationHistory.length - 1];
                if (lastSim.params.r == r && lastSim.params.rpm == rpm && 
                    lastSim.params.stroke == stroke && lastSim.params.bore == bore) {
                    
                    if (!isAnimating) {
                        isAnimating = true;
                        animateEngine();
                    }
                    return; // Salir sin hacer fetch
                }
            }

            // Llamada a la API real
            const response = await fetch(`http://localhost:8000/simulate?r=${r}&rpm=${rpm}&stroke=${stroke}&bore=${bore}`);
            const json = await response.json();

            if (json.status !== "success") {
                throw new Error("Simulación falló");
            }

            const data = json.data;

            // Generar pares (x, y) = (Volumen, Presión) para Chart.js
            const chartData = data.volume.map((v, i) => ({
                x: v,
                y: data.pressure[i]
            }));

            // Update Chart
            pvChart.data.datasets[0].data = chartData;
            pvChart.update();

            // Update Metrics UI
            document.getElementById('val-efficiency').innerText = data.metrics.efficiency.toFixed(1) + ' %';
            document.getElementById('val-power').innerText = data.metrics.power.toFixed(1) + ' kW';
            document.getElementById('val-imep').innerText = (data.metrics.imep / 1000).toFixed(0) + ' kPa';
            document.getElementById('val-tmax').innerText = data.metrics.tmax.toFixed(0) + ' K';

            // Guardar en el historial
            simCounter++;
            const newSim = {
                id: simCounter,
                params: { r, rpm, stroke, bore },
                data: data
            };
            simulationHistory.push(newSim);
            updateHistoryTable();

            // Start animation if not running
            if (!isAnimating) {
                isAnimating = true;
                animateEngine();
            }

        } catch (err) {
            console.error("Error during simulation:", err);
            alert("Error al contactar el servidor de simulación.");
        } finally {
            // Restore UI
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
            btnSimulate.disabled = false;
        }
    });
    btnStop.addEventListener('click', () => {
        if (isAnimating) {
            isAnimating = false;
            cancelAnimationFrame(animRequest);
            console.log("simulación pausada")
        }
    })

    // --- History Table Logic ---
    function updateHistoryTable() {
        const tbody = document.getElementById('history-body');
        tbody.innerHTML = '';
        simulationHistory.forEach(sim => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${sim.id}</td>
                <td>${sim.params.r}</td>
                <td>${sim.params.rpm}</td>
                <td>${sim.data.metrics.efficiency.toFixed(2)} %</td>
                <td>${(sim.data.metrics.imep / 1000).toFixed(1)}</td>
                <td>${sim.data.metrics.power.toFixed(2)}</td>
                <td><button class="btn-small" onclick="window.viewDetailedData(${sim.id})">Ver Datos Completos</button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Modal Logic (Global for onclick)
    window.viewDetailedData = function (id) {
        const sim = simulationHistory.find(s => s.id === id);
        if (!sim) return;

        document.getElementById('modal-sim-id').innerText = id;
        const tbody = document.getElementById('modal-data-body');

        // Render large data table efficiently
        const rowsHtml = sim.data.theta.map((th, i) => `
            <tr>
                <td>${th.toFixed(4)}</td>
                <td>${sim.data.volume[i].toExponential(4)}</td>
                <td>${sim.data.pressure[i].toExponential(4)}</td>
                <td>${sim.data.temperature[i].toFixed(2)}</td>
            </tr>
        `).join('');

        tbody.innerHTML = rowsHtml;
        document.getElementById('data-modal').classList.remove('hidden');
    }

    // Close Modal
    document.getElementById('close-modal').addEventListener('click', () => {
        document.getElementById('data-modal').classList.add('hidden');
    });
});
