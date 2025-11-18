// Prevent duplicates
if (window._truncatePanel) {
    window._truncatePanel.remove();
    cancelAnimationFrame(window._truncateRAF);
}

// ==== CREATE PANEL UI ====
const panel = document.createElement("div");
panel.style = `
    position:fixed;
    top:20px;
    right:20px;
    padding:16px 20px;
    width:230px;
    background:rgba(255,255,255,0.25);
    backdrop-filter:blur(10px);
    border-radius:16px;
    border:1px solid rgba(255,255,255,0.35);
    box-shadow:0 10px 30px rgba(0,0,0,0.2);
    font-family:'Inter', sans-serif;
    color:#111;
    z-index:999999;
    animation:fadeIn .4s ease forwards;
    cursor:default;
`;
panel.id = "_truncatePanel";

panel.innerHTML = `
    <style>
        @keyframes fadeIn {
            from {opacity:0; transform:translateY(-10px);}
            to {opacity:1; transform:translateY(0);}
        }
        @keyframes pulse {
            0% {transform:scale(1);}
            50% {transform:scale(1.3);}
            100% {transform:scale(1);}
        }
        .status-dot {
            width:10px;
            height:10px;
            border-radius:50%;
            display:inline-block;
            margin-right:6px;
        }
        .btn-modern {
            width:100%;
            padding:10px;
            border:none;
            border-radius:10px;
            font-size:14px;
            margin-top:12px;
            color:#fff;
            background:#4a8cff;
            cursor:pointer;
            transition:0.25s;
        }
        .btn-modern:hover {
            background:#1e66ff;
            transform:translateY(-1px);
            box-shadow:0 4px 15px rgba(0,0,0,0.2);
        }
        .btn-stop {
            background:#ff4e4e !important;
        }
        .btn-stop:hover {
            background:#ff0000 !important;
        }
    </style>

    <div style="font-size:17px; font-weight:600; margin-bottom:8px;">Auto Holder</div>

    <div id="_truncateStatus" style="font-size:14px; display:flex; align-items:center;">
        <span id="_truncateDot" class="status-dot" style="background:#777;"></span>
        <span id="_truncateText">Stopped</span>
    </div>

    <button id="_truncateToggle" class="btn-modern">Start</button>
`;

document.body.appendChild(panel);
window._truncatePanel = panel;


// ========== DRAG TO MOVE PANEL ==========
let isDown = false, offsetX, offsetY;
panel.addEventListener("mousedown", (e) => {
    isDown = true;
    offsetX = e.clientX - panel.offsetLeft;
    offsetY = e.clientY - panel.offsetTop;
    panel.style.transition = "0s";
});
document.addEventListener("mouseup", () => (isDown = false));
document.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    panel.style.left = e.clientX - offsetX + "px";
    panel.style.top = e.clientY - offsetY + "px";
});


// ========== AUTO CLICK LOGIC ==========
let running = false;

const statusDot = document.getElementById("_truncateDot");
const statusText = document.getElementById("_truncateText");
const toggleBtn = document.getElementById("_truncateToggle");

function updateStatus(text, color, animate = false) {
    statusText.textContent = text;
    statusDot.style.background = color;
    statusDot.style.animation = animate ? "pulse 1s infinite" : "none";
}

function loop() {
    if (!running) return;

    // 🟧 Detect LIMIT using the NEW class
    const limitElement = document.querySelector(".truncate.hidden.xs\\:inline");

    if (limitElement) {
        updateStatus("Limit Reached", "orange", true);
        window._truncateRAF = requestAnimationFrame(loop);
        return;
    }

    // No limit → auto-click continues
    const el = document.querySelector(".truncate:not(.hidden)");

    if (el) {
        updateStatus("Found & Clicked", "limegreen", true);
        el.click();
    } else {
        updateStatus("Searching...", "#777", true);
    }

    window._truncateRAF = requestAnimationFrame(loop);
}


// ========== BUTTON CLICK ==========
toggleBtn.onclick = () => {
    running = !running;

if (running) {
        toggleBtn.textContent = "Stop";
        toggleBtn.classList.add("btn-stop");
        updateStatus("Searching...", "#777", true);
        loop();
    } else {
        toggleBtn.textContent = "Start";
        toggleBtn.classList.remove("btn-stop");
        updateStatus("Stopped", "#777", false);
    }
};