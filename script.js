const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const logo = document.getElementById("logoImg");

canvas.width = 500;
canvas.height = 400;

let score = 0;
let timeLeft = 30;
let gameActive = false; 
let gameTimer = null;

let target = {
    x: 250,
    y: 200,
    radius: 30,
    dx: 2.5,
    dy: 2.5,
    color: "#e74c3c"
};

function randomColor() {
    const colors = ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6"];
    return colors[Math.floor(Math.random() * colors.length)];
}

function updatePosition() {
    if (!gameActive) return;
    target.x += target.dx;
    target.y += target.dy;
    if (target.x + target.radius > canvas.width || target.x - target.radius < 0) target.dx *= -1;
    if (target.y + target.radius > canvas.height || target.y - target.radius < 0) target.dy *= -1;
}

// 繪製 Logo 的專用函式
function drawLogo(x, y, width, height, opacity = 1) {
    if (logo.complete && logo.naturalWidth !== 0) {
        ctx.save(); // 保存當前狀態
        ctx.globalAlpha = opacity; // 設定透明度
        ctx.drawImage(logo, x, y, width, height);
        ctx.restore(); // 恢復狀態
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameActive) {
        // --- 1. 遊戲進行中的背景 Logo (半透明浮水印效果) ---
        // 放在右上角，稍微透明一點才不會干擾視線
        drawLogo(canvas.width - 110, 10, 100, 60, 0.6);

        // --- 2. 畫球 ---
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
        ctx.fillStyle = target.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = target.color;
        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0;

        // --- 3. 畫時間 ---
        ctx.fillStyle = "#333";
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "left";
        ctx.fillText(`時間: ${Math.ceil(timeLeft)}s`, 15, 35);

    } else {
        // --- 遊戲結束/開始畫面 ---
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 結束畫面時 Logo 放在中間且不透明
        const floatingY = 50 + Math.sin(Date.now() / 500) * 8;
        drawLogo(canvas.width / 2 - 130, floatingY, 260, 150, 1);

        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        if (timeLeft <= 0) {
            ctx.font = "bold 30px Arial";
            ctx.fillText(`最終得分: ${score}`, canvas.width / 2, 240);
            ctx.font = "18px Arial";
            ctx.fillStyle = "#bdc3c7";
            ctx.fillText("點擊畫面重新挑戰", canvas.width / 2, 290);
        } else {
            ctx.font = "22px Arial";
            ctx.fillText("點擊畫面開始遊戲", canvas.width / 2, 260);
        }
    }

    updatePosition();
    requestAnimationFrame(draw);
}

// 事件監聽與遊戲邏輯保持不變...
canvas.addEventListener("mousedown", function(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (!gameActive) {
        startGame();
        return;
    }

    const distance = Math.sqrt((mouseX - target.x)**2 + (mouseY - target.y)**2);
    if (distance < target.radius) {
        score++;
        scoreDisplay.innerText = score;
        target.radius = Math.max(12, target.radius - 0.8); 
        target.dx *= 1.07; 
        target.dy *= 1.07;
        target.color = randomColor();
        moveTarget();
    }
});

function moveTarget() {
    target.x = Math.random() * (canvas.width - target.radius * 2) + target.radius;
    target.y = Math.random() * (canvas.height - target.radius * 2) + target.radius;
}

function startGame() {
    score = 0;
    timeLeft = 30;
    scoreDisplay.innerText = score;
    target.radius = 30;
    target.dx = 2.5;
    target.dy = 2.5;
    gameActive = true;
    moveTarget();
    if (gameTimer) clearInterval(gameTimer);
    gameTimer = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            gameActive = false;
            clearInterval(gameTimer);
        }
    }, 1000);
}

draw();
