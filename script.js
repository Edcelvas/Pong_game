// Select elements from the DOM
const gameArea = document.getElementById("pong-game");
const startBtn = document.getElementById("startBtn");
const difficultySelection = document.getElementById("difficulty-selection");
const easyBtn = document.getElementById("easy");
const hardBtn = document.getElementById("hard");
const playerScoreEl = document.getElementById("player-score");
const cpuScoreEl = document.getElementById("cpu-score");
const outcomeMessage = document.getElementById("outcome-message");

// Game variables
let ball, playerPaddle, cpuPaddle;
let ballX, ballY, ballVelocityX, ballVelocityY, ballSpeed;
let playerPaddleY, cpuPaddleY;
let playerScore = 0, cpuScore = 0;
let cpuPaddleSpeed; // Set based on difficulty selected
let requestId; 

// Start, easy selection, hard selection event listeners
startBtn.addEventListener("click", function() {
    startBtn.classList.add("hidden");
    difficultySelection.classList.remove("hidden");
});

easyBtn.addEventListener("click", function() {
    setDifficulty("easy");
});

hardBtn.addEventListener("click", function() {
    setDifficulty("hard");
});

// Set paddle speed for difficulty and initialize game
function setDifficulty(difficulty) {
    cpuPaddleSpeed = difficulty === "easy" ? 0.005 : 0.008; //paddle speed for cpu
    ballVelocityX = difficulty === "easy" ? 4 : 6.5;    // ball speed depending on dicciculty
    ballVelocityY = difficulty === "easy" ? 4 : 6.5;
    difficultySelection.classList.add("hidden");
    initializeGame();
}

// Adjust game based on game area's size
function resizeGame() {
    const gameWidth = gameArea.clientWidth;
    const gameHeight = gameArea.clientHeight;

    ballX = gameWidth / 2 - 10;
    ballY = gameHeight / 2 - 10;

    playerPaddleY = gameHeight / 2 - 50;
    cpuPaddleY = gameHeight / 2 - 50;

    playerPaddle.style.top = `${playerPaddleY}px`;
    cpuPaddle.style.top = `${cpuPaddleY}px`;
}

// Initialize game elements
function initializeGame() {
    gameArea.style.display = "flex";

    ball = document.createElement("div");
    ball.className = "ball";
    gameArea.appendChild(ball);

    playerPaddle = document.createElement("div");
    playerPaddle.className = "paddle";
    gameArea.appendChild(playerPaddle);
    playerPaddle.style.left = "30px";

    cpuPaddle = document.createElement("div");
    cpuPaddle.className = "paddle";
    gameArea.appendChild(cpuPaddle);
    cpuPaddle.style.right = "30px";

    resizeGame();
    window.addEventListener('resize', resizeGame);

    document.addEventListener("keydown", function(event) {
        const step = 30;
        if (event.key === "ArrowUp") {
            playerPaddleY = Math.max(0, playerPaddleY - step);
        } else if (event.key === "ArrowDown") {
            playerPaddleY = Math.min(gameArea.clientHeight - playerPaddle.offsetHeight, playerPaddleY + step);
        }
        playerPaddle.style.top = `${playerPaddleY}px`;
    });

    requestId = requestAnimationFrame(update);
}

// Update scores and check for game over
function updateScores() {
    playerScoreEl.textContent = `Player: ${playerScore}`;
    cpuScoreEl.textContent = `CPU: ${cpuScore}`;

    if (playerScore >= 10 || cpuScore >= 10) {
        cancelAnimationFrame(requestId);
        outcomeMessage.textContent = playerScore >= 10 ? "You Win!" : "You Lose!";
        outcomeMessage.style.display = "block";
        ball.style.display = "none";
        playerPaddle.style.display = "none";
        cpuPaddle.style.display = "none";
    }
}

// Reset the ball to the center after a score
function resetBall() {
    ballX = gameArea.clientWidth / 2 - 10;
    ballY = gameArea.clientHeight / 2 - 10;
    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;
}

// Main game update loop
function update() {
    ballX += ballVelocityX;
    ballY += ballVelocityY;

    let paddleCenter = cpuPaddleY + cpuPaddle.offsetHeight / 2;
    let deltaY = ballY - paddleCenter;
    cpuPaddleY += Math.sign(deltaY) * Math.min(Math.abs(deltaY), cpuPaddleSpeed * gameArea.clientHeight);
    cpuPaddleY = Math.max(0, Math.min(gameArea.clientHeight - cpuPaddle.offsetHeight, cpuPaddleY));
    cpuPaddle.style.top = `${cpuPaddleY}px`;

    if (ballY <= 0 || ballY + ball.offsetHeight >= gameArea.clientHeight) {
        ballVelocityY *= -1;
    }

    let ballRect = ball.getBoundingClientRect();
    let playerPaddleRect = playerPaddle.getBoundingClientRect();
    let cpuPaddleRect = cpuPaddle.getBoundingClientRect();

    if (ballRect.left <= playerPaddleRect.right && ballRect.right >= playerPaddleRect.left &&
        ballRect.bottom >= playerPaddleRect.top && ballRect.top <= playerPaddleRect.bottom) {
        ballVelocityX *= -1;
        ballX = playerPaddleRect.right - gameArea.offsetLeft + 1;
    }

    if (ballRect.right >= cpuPaddleRect.left && ballRect.left <= cpuPaddleRect.right &&
        ballRect.bottom >= cpuPaddleRect.top && ballRect.top <= cpuPaddleRect.bottom) {
        ballVelocityX *= -1;
        ballX = cpuPaddleRect.left - ball.offsetWidth - gameArea.offsetLeft - 1;
    }

    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;

    if (ballX < 0) {
        cpuScore++;
        updateScores();
        resetBall();
    } else if (ballX + ball.offsetWidth > gameArea.clientWidth) {
        playerScore++;
        updateScores();
        resetBall();
    }

    if (playerScore < 10 && cpuScore < 10) {
        requestId = requestAnimationFrame(update);
    }
}