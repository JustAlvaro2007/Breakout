// board
let board;
let boardWidth = 500;
let boardHeight = 500;
let context;

// player
let playerWidth = 80; // Adjusted player width
let playerHeight = 10;
let playerVelocityX = 10;

let player = {
    x: boardWidth / 2 - playerWidth / 2,
    y: boardHeight - playerHeight - 5,
    width: playerWidth,
    height: playerHeight,
    velocityX: playerVelocityX,
};

// ball
let ballWidth = 10;
let ballHeight = 10;
let ballVelocityX = 3; // Adjusted ball velocity
let ballVelocityY = 2; // Adjusted ball velocity

// Ball
let ball = {
    x: boardWidth / 2,
    y: boardHeight / 2,
    width: ballWidth,
    height: ballHeight,
    velocityX: ballVelocityX,
    velocityY: ballVelocityY,
    color: "blue" // Set the color of the ball here, e.g., "blue"
};

// Ball-Array
let balls = [];
let maxBalls = 2;

// blocks
let blockArray = [];
let blockWidth = 50;
let blockHeight = 10;
let blockColumns = 8;
let blockRows = 3;
let blockMaxRows = 10;
let blockCount = 0;

let blockX = 15;
let blockY = 45;

let score = 0;
let gameOver = false;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Draw initial player
    context.fillStyle = "lightgreen";
    context.fillRect(player.x, player.y, player.width, player.height);

    requestAnimationFrame(update);
    document.addEventListener("keydown", movePlayer);

    // Create blocks
    createBlocks();
};

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // Player
    context.fillStyle = "rgb(255, 145, 0)";
    context.fillRect(player.x, player.y, player.width, player.height);

    context.fillStyle = "white";
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    // Bounce ball off walls
    if (ball.y <= 0) {
        ball.velocityY *= -1;
    } else if (ball.x <= 0 || ball.x + ball.width >= boardWidth) {
        ball.velocityX *= -1;
    } else if (ball.y + ball.height >= boardHeight) {
        // Check if there are still balls in play
        if (balls.length === 0) {
            context.font = "20px sans-serif";
            context.fillText("Game Over: press 'space' to Restart", 80, 400);
            gameOver = true;
        }
    }

    // Bounce the ball off player paddle
    if (topCollision(ball, player) || bottomCollision(ball, player)) {
        ball.velocityY *= -1;
    } else if (leftCollision(ball, player) || rightCollision(ball, player)) {
        ball.velocityX *= -1;
    }

    // Blocks
    context.fillStyle = "rgb(255, 145, 0)";
    for (let i = 0; i < blockArray.length; i++) {
        let block = blockArray[i];
        if (!block.break) {
            if (topCollision(ball, block) || bottomCollision(ball, block)) {
                block.break = true;
                ball.velocityY *= -1;
                blockCount -= 1;
                score += 20;
                addBall(block.x, block.y);
            } else if (leftCollision(ball, block) || rightCollision(ball, block)) {
                block.break = true;
                ball.velocityX *= -1;
                blockCount -= 1;
                score += 20;
                addBall(block.x, block.y);
            }
            context.fillRect(block.x, block.y, block.width, block.height);
        }
    }

    // Kollisionen für die Bälle
    for (let i = 0; i < balls.length; i++) {
        let currentBall = balls[i];
        context.fillStyle = "white";

        // Check for collisions with the game board boundaries
        if (currentBall.x + currentBall.velocityX < 0 || currentBall.x + currentBall.width + currentBall.velocityX > boardWidth) {
            currentBall.velocityX *= -1;
        }

        if (currentBall.y + currentBall.velocityY < 0) {
            currentBall.velocityY *= -1;
        } else if (currentBall.y + currentBall.height + currentBall.velocityY > boardHeight) {
            // Ball hits the bottom boundary, remove it
            balls.splice(i, 1);
            i--; // Decrement the index to account for the removed ball
            continue;
        }

        // Check collision with the player
        if (playerCollision(currentBall, player)) {
            currentBall.velocityY *= -1;
        }

        currentBall.x += currentBall.velocityX;
        currentBall.y += currentBall.velocityY;
        context.fillRect(currentBall.x, currentBall.y, currentBall.width, currentBall.height);

        // Kollisionslogik für die Bälle mit den Blöcken
        for (let j = 0; j < blockArray.length; j++) {
            let block = blockArray[j];
            if (!block.break && detectCollision(currentBall, block)) {
                block.break = true;
                currentBall.velocityY *= -1;
                blockCount -= 1;
                score += 20;
                addBall(block.x, block.y);
            }
        }
    }

    // Next level
    if (blockCount == 0) {
        score += 1 * blockRows * blockColumns;
        blockRows = Math.min(blockRows + 1, blockMaxRows);
        createBlocks();
    }

    // Score
    context.font = "20px sans-serif";
    context.fillText(score, 10, 25);
}


function outOfBounds(xPosition) {
    return xPosition < 0 || xPosition + player.width > boardWidth;
}

function movePlayer(e) {
    if (gameOver) {
        if (e.code == "Space") {
            resetGame();
        }
    }
    if (e.code == "ArrowLeft") {
        let nextPlayerX = player.x - player.velocityX;
        if (!outOfBounds(nextPlayerX)) {
            player.x = nextPlayerX;
        }
    } else if (e.code == "ArrowRight") {
        let nextPlayerX = player.x + player.velocityX;
        if (!outOfBounds(nextPlayerX)) {
            player.x = nextPlayerX;
        }
    }
}

function detectCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function topCollision(ball, block) {
    return detectCollision(ball, block) && ball.y + ball.height >= block.y;
}

function bottomCollision(ball, block) {
    return detectCollision(ball, block) && block.y + block.height >= ball.y;
}

function leftCollision(ball, block) {
    return detectCollision(ball, block) && ball.x + ball.width >= block.x;
}

function rightCollision(ball, block) {
    return detectCollision(ball, block) && block.x + block.width >= ball.x;
}

function playerCollision(ball, player) {
    return (
        ball.x < player.x + player.width &&
        ball.x + ball.width > player.x &&
        ball.y + ball.height > player.y
    );
}

function createBlocks() {
    blockArray = [];
    for (let c = 0; c < blockColumns; c++) {
        for (let r = 0; r < blockRows; r++) {
            let block = {
                x: blockX + c * blockWidth + c * 10,
                y: blockY + r * blockHeight + r * 10,
                width: blockWidth,
                height: blockHeight,
                break: false,
            };
            blockArray.push(block);
        }
    }
    blockCount = blockArray.length;
}

function resetGame() {
    gameOver = false;
    player = {
        x: boardWidth / 2 - playerWidth / 2,
        y: boardHeight - playerHeight - 5,
        width: playerWidth,
        height: playerHeight,
        velocityX: playerVelocityX,
    };
    balls = [];
    ball = {
        x: boardWidth / 2,
        y: boardHeight / 2,
        width: ballWidth,
        height: ballHeight,
        velocityX: ballVelocityX,
        velocityY: ballVelocityY,
    };
    blockArray = [];
    blockRows = 3;
    score = 0;
    createBlocks();
    addBall(boardWidth / 2, boardHeight / 2);
}

function addBall(spawnX, spawnY) {
    if (balls.length < maxBalls) {
        let newBall = {
            x: spawnX + blockWidth / 2,
            y: spawnY - ballHeight,
            width: ballWidth,
            height: ballHeight,
            velocityX: ballVelocityX,
            velocityY: ballVelocityY,
        };
        balls.push(newBall);
    }
}

// Start the game
resetGame();


























