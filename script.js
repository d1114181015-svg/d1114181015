const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");

// 設定畫布大小
canvas.width = 500;
canvas.height = 400;

// 遊戲變數
let score = 0;
let timeLeft = 30; // 30秒限時
let gameActive = true;
let highScore = localStorage.getItem("highScore") || 0;

let target = {
    x: 250,
    y: 200,
    radius: 30,
    dx: 2, // X軸速度
    dy: 2, // Y軸速度
    color: "#e74c3c"
};

// 隨機顏色產生器
function randomColor() {
    const colors = ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6"];
    return colors[Math.floor(Math.random() * colors.length)];
}

// 移動目標並處理碰撞
function updatePosition() {
    if (!gameActive) return;

    target.x += target.dx;
    target.y += target.dy;

    // 碰到左右邊界反彈
    if (target.x + target.radius > canvas.width || target.x - target.radius < 0) {
        target.dx *= -1;
    }
    // 碰到上下邊界反彈
    if (target.y + target.radius > canvas.height || target.y - target.radius < 0) {
        target.dy *= -1;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameActive) {
        // 繪製目標球體
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
        ctx.fillStyle = target.color;
        ctx.shadowBlur = 15; // 加入一點光暈效果
        ctx.shadowColor = target.color;
        ctx.fill();
        ctx.closePath();

        // 繪製剩餘時間
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#333";
        ctx.font = "20px Arial";
        ctx.fillText(`時間: ${Math.ceil(timeLeft)}s`, 10, 30);
    } else {
        // 結束畫面
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "30px Arial";
        ctx.fillText("遊戲結束！", canvas.width / 2, canvas.height / 2);
        ctx.font = "20px Arial";
        ctx.fillText(`最終得分: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText("點擊畫布重新開始", canvas.width / 2, canvas.height / 2 + 80);
    }

    updatePosition();
    requestAnimationFrame(draw);
}

// 點擊事件
canvas.addEventListener("mousedown", function(event) {
    if (!gameActive) {
        resetGame();
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const distance = Math.sqrt((mouseX - target.x)**2 + (mouseY - target.y)**2);

    if (distance < target.radius) {
        // 擊中目標
        score++;
        scoreDisplay.innerText = score;
        
        // 難度曲線升級
        target.radius = Math.max(10, target.radius - 1); // 球越變越小 (最低 10)
        target.dx *= 1.05; // 速度提升 5%
        target.dy *= 1.05;
        
        // 立即瞬移到新位置避免連續點擊同一點
        moveTarget();
    }
});

function moveTarget() {
    target.x = Math.random() * (canvas.width - target.radius * 2) + target.radius;
    target.y = Math.random() * (canvas.height - target.radius * 2) + target.radius;
}

function resetGame() {
    score = 0;
    timeLeft = 30;
    target.radius = 30;
    target.dx = 2;
    target.dy = 2;
    scoreDisplay.innerText = score;
    gameActive = true;
    moveTarget();
}

// 倒數計時邏輯
setInterval(() => {
    if (gameActive) {
        timeLeft -= 1;
        if (timeLeft <= 0) {
            gameActive = false;
            if (score > highScore) {
                localStorage.setItem("highScore", score);
                alert("新紀錄！");
            }
        }
    }
}, 1000);

// 啟動遊戲循環
draw();