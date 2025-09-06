// Simple Whack-a-Mole Game, very gud1!1!
let game = {
    score: 0,
    timeLeft: 30,
    isPlaying: false,
    activeMole: null,
    gameTimer: null,
    moleTimer: null,
    baseHideTime: 2000,  // Starting hide time (2 seconds)
    minHideTime: 500,    // Minimum hide time (0.5 seconds)
    spawnDelay: 200      // Reduced spawn delay
};

// Get DOM elements
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const gameBoard = document.getElementById('gameBoard');
const gameOver = document.getElementById('gameOver');
const finalScore = document.getElementById('finalScore');
const playAgainBtn = document.getElementById('playAgainBtn');

// Create game board
function createBoard() {
    gameBoard.innerHTML = '';

    for (let i = 0; i < 9; i++) {
        const hole = document.createElement('div');
        hole.className = 'hole';
        hole.dataset.id = i;

        const mole = document.createElement('div');
        mole.className = 'mole';
        mole.textContent = '🐹';

        hole.appendChild(mole);
        gameBoard.appendChild(hole);

        // Add click event to mole
        mole.addEventListener('click', hitMole);
    }
}

// Update the game over modal display
function showGameOver() {
    gameOver.classList.add('show');
}

function hideGameOver() {
    gameOver.classList.remove('show');
}

// Calculate dynamic hide time based on score
function getDynamicHideTime() {
    // Reduce hide time by 50ms for every 20 points scored
    const reduction = Math.floor(game.score / 20) * 50;
    const newHideTime = game.baseHideTime - reduction;
    return Math.max(newHideTime, game.minHideTime);
}

// Calculate dynamic spawn delay based on score
function getDynamicSpawnDelay() {
    // Reduce spawn delay by 10ms for every 30 points scored
    const reduction = Math.floor(game.score / 30) * 10;
    const newSpawnDelay = game.spawnDelay - reduction;
    return Math.max(newSpawnDelay, 50); // Minimum 50ms delay
}

// Start the game
function startGame() {
    if (game.isPlaying) return;

    game.isPlaying = true;
    game.score = 0;
    game.timeLeft = 30;

    startBtn.textContent = 'Playing...';
    startBtn.disabled = true;
    hideGameOver();

    updateDisplay();

    // Start game timer
    game.gameTimer = setInterval(() => {
        game.timeLeft--;
        updateDisplay();

        if (game.timeLeft <= 0) {
            endGame();
        }
    }, 1000);

    spawnThingy();
}

// Spawn a mole in random hole
function spawnThingy() {
    if (!game.isPlaying) return;

    // Hide current mole if any
    if (game.activeMole) {
        game.activeMole.classList.remove('active');
    }

    // Get random hole
    const holes = document.querySelectorAll('.mole');
    const randomIndex = Math.floor(Math.random() * holes.length);
    game.activeMole = holes[randomIndex];

    // Show mole
    game.activeMole.classList.add('active');

    // Get dynamic hide time based on current score
    const hideTime = getDynamicHideTime();

    game.moleTimer = setTimeout(() => {
        if (game.activeMole) {
            game.activeMole.classList.remove('active');
            game.activeMole = null;
        }

        // Spawn next mole after dynamic delay
        if (game.isPlaying) {
            const spawnDelay = getDynamicSpawnDelay();
            setTimeout(spawnThingy, spawnDelay);
        }
    }, hideTime);
}

// Hit the mole
function hitMole(e) {
    if (!game.isPlaying) return;

    const mole = e.target;

    if (mole.classList.contains('active')) {
        // Hit!
        game.score += 10;
        mole.classList.remove('active');
        mole.classList.add('hit');

        // Remove hit effect after delay
        setTimeout(() => {
            mole.classList.remove('hit');
        }, 200);

        // Clear current mole timer
        if (game.moleTimer) {
            clearTimeout(game.moleTimer);
        }

        game.activeMole = null;
        updateDisplay();

        // Spawn new mole quickly with dynamic delay
        const spawnDelay = getDynamicSpawnDelay();
        setTimeout(spawnThingy, spawnDelay);
    }
}

// Update score and timer display
function updateDisplay() {
    scoreElement.textContent = game.score;
    timerElement.textContent = game.timeLeft;
}

// End the game
function endGame() {
    game.isPlaying = false;

    // Clear timers
    if (game.gameTimer) {
        clearInterval(game.gameTimer);
    }
    if (game.moleTimer) {
        clearTimeout(game.moleTimer);
    }

    // Hide any active mole
    if (game.activeMole) {
        game.activeMole.classList.remove('active');
        game.activeMole = null;
    }

    // Reset button
    startBtn.textContent = 'Start Game';
    startBtn.disabled = false;

    // Show game over screen
    finalScore.textContent = game.score;
    showGameOver();
}

// Reset the game
function resetGame() {
    endGame();
    game.score = 0;
    game.timeLeft = 30;
    updateDisplay();
    hideGameOver();
    startBtn.disabled = false;
}

// Event listeners
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', resetGame);

// Initialize the game
createBoard();
updateDisplay();
