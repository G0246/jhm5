/**
 * Simple Tic Tac Toe Game
 */

// DOM Elements
const titleScreen = document.getElementById('titleScreen');
const gameScreen = document.getElementById('gameScreen');
const boardElement = document.getElementById('gameBoard');
const statusElement = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const backBtn = document.getElementById('backBtn');
const onePlayerBtn = document.getElementById('onePlayerBtn');
const twoPlayerBtn = document.getElementById('twoPlayerBtn');

// Game state variables
let board;          // Array to track the game board state ('' for empty, 'X' or 'O' for filled)
let currentPlayer;  // Tracks whose turn it is ('X' or 'O')
let gameActive;     // Boolean to track if the game is still ongoing
let mode;           // Game mode: '1p' for 1 player (vs computer), '2p' for 2 players
let isAiThinking;   // Boolean to prevent player moves while AI is thinking

/**
 * Initializes the game board to starting state
 * Creates empty board, sets X as first player, and renders the UI
 */
function initBoard() {
    // Create an array of 9 empty strings (one for each cell)
    board = Array(9).fill('');
    // X always goes first
    currentPlayer = 'X';
    // Set game to active
    gameActive = true;
    // AI is not thinking at start
    isAiThinking = false;
    // Draw the board on screen
    renderBoard();
    // Update status message
    statusElement.textContent = `Player ${currentPlayer}'s turn`;
}

/**
 * Renders the game board to the UI based on current state
 * Creates cell divs, adds content and event listeners
 */
function renderBoard() {
    // Clear any existing cells
    boardElement.innerHTML = '';

    // Create and add each cell
    board.forEach((cell, idx) => {
        const cellDiv = document.createElement('div');
        cellDiv.className = 'cell';

        // Show cell if it has content (X or O)
        if (cell) {
            cellDiv.textContent = cell;
            cellDiv.setAttribute('data-player', cell);
        }

        // Add click handler to each cell
        cellDiv.addEventListener('click', () => handleCellClick(idx));

        // Add cell to the board
        boardElement.appendChild(cellDiv);
    });
}

/**
 * Handles when a player clicks on a cell
 * @param {number} idx - The index of the cell that was clicked (0-8)
 */

function handleCellClick(idx) {
    // Ignore clicks if game is over, cell is already filled, or AI is thinking
    if (!gameActive || board[idx] || isAiThinking) return;

    // In 1-player mode, only allow clicks when it's the human player's turn
    if (mode === '1p' && currentPlayer === 'O') return;

    // Make the player's move
    makeMove(idx, currentPlayer);

    // Check if this move resulted in a win
    if (checkWin(currentPlayer)) {
        statusElement.textContent = `Player ${currentPlayer} wins!`;
        gameActive = false;
        return;
    }
    // Check if this move resulted in a draw (all cells filled)
    else if (board.every(cell => cell)) {
        statusElement.textContent = "It's a draw!";
        gameActive = false;
        return;
    }

    // Handle next turn based on game mode
    if (mode === '1p' && currentPlayer === 'X') {
        // In 1-player mode after player's move, it's computer's turn
        currentPlayer = 'O';
        isAiThinking = true; // Prevent further clicks
        statusElement.textContent = `Computer is thinking...`;
        // Delay computer move to make it feel more natural
        setTimeout(aiMove, 700);
    } else {
        // In 2-player mode, or computer just moved in 1-player mode, switch players
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusElement.textContent = `Player ${currentPlayer}'s turn`;
    }
}

/**
 * Places a player's symbol on the board
 * @param {number} idx - The cell index (0-8)
 * @param {string} player - The player symbol ('X' or 'O')
 */

function makeMove(idx, player) {
    board[idx] = player;
    renderBoard();
}

/**
 * Computer makes a move using the Minimax algorithm
 * This makes the AI unbeatable by exploring all possible game outcomes
 */
function aiMove() {
    // Don't move if the game is already over
    if (!gameActive) {
        isAiThinking = false;
        return;
    }

    // Get all empty cells
    const emptyCells = board.map((cell, idx) => cell === '' ? idx : null).filter(idx => idx !== null);
    if (emptyCells.length === 0) {
        isAiThinking = false;
        return;
    }

    // Use minimax to find the best move
    const bestMove = minimax(board, 'O').index;
    makeMove(bestMove, 'O');

    // Check if computer won
    if (checkWin('O')) {
        statusElement.textContent = `Player O wins!`;
        gameActive = false;
        isAiThinking = false;
        return;
    }

    // Check if the game is a draw
    else if (board.every(cell => cell)) {
        statusElement.textContent = "It's a draw!";
        gameActive = false;
        isAiThinking = false;
        return;
    }

    // Return control to the player
    currentPlayer = 'X';
    isAiThinking = false; // Allow player clicks again
    statusElement.textContent = `Player X's turn`;
}

/**
 * Minimax algorithm implementation
 * Recursively explores all possible game states to find the optimal move
 * @param {Array} currentBoard - The current state of the board
 * @param {string} player - The current player ('X' or 'O')
 * @returns {Object} - Object with 'score' and 'index' properties
 */
function minimax(currentBoard, player) {
    // Get available moves (empty cells)
    const availableMoves = currentBoard.map((cell, idx) => cell === '' ? idx : null).filter(idx => idx !== null);

    // Base cases - check for terminal states
    if (checkWinOnBoard(currentBoard, 'X')) {
        return { score: -10 }; // Player wins (bad for AI)
    } else if (checkWinOnBoard(currentBoard, 'O')) {
        return { score: 10 };  // AI wins (good for AI)
    } else if (availableMoves.length === 0) {
        return { score: 0 };   // Draw
    }

    // Store all possible moves and their scores
    const moves = [];

    // Loop through available moves
    for (let i = 0; i < availableMoves.length; i++) {
        const move = {};
        move.index = availableMoves[i];

        // Make the move on a copy of the board
        const newBoard = [...currentBoard];
        newBoard[move.index] = player;

        // Recursively call minimax for the opponent
        if (player === 'O') {
            // AI's turn - get score from player's perspective
            const result = minimax(newBoard, 'X');
            move.score = result.score;
        } else {
            // Player's turn - get score from AI's perspective
            const result = minimax(newBoard, 'O');
            move.score = result.score;
        }

        // Add this move to our moves array
        moves.push(move);
    }

    // Choose the best move based on current player
    let bestMove;
    if (player === 'O') {
        // AI wants to maximize score
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        // Player wants to minimize AI's score
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    // Return the chosen move
    return moves[bestMove];
}

/**
 * Checks if a player has won on a given board state
 * Similar to checkWin but works on any board array
 * @param {Array} boardState - The board state to check
 * @param {string} player - The player symbol to check for ('X' or 'O')
 * @returns {boolean} - True if the player has won, false otherwise
 */
function checkWinOnBoard(boardState, player) {
    const winPatterns = [
        [0,1,2],[3,4,5],[6,7,8], // rows
        [0,3,6],[1,4,7],[2,5,8], // cols
        [0,4,8],[2,4,6]          // diags
    ];
    return winPatterns.some(pattern => pattern.every(idx => boardState[idx] === player));
}

/**
 * Checks if a player has won the game
 * @param {string} player - The player symbol to check for ('X' or 'O')
 * @returns {boolean} - True if the player has won, false otherwise
 */

function checkWin(player) {
    const winPatterns = [
        [0,1,2],[3,4,5],[6,7,8], // rows
        [0,3,6],[1,4,7],[2,5,8], // cols
        [0,4,8],[2,4,6]          // diags
    ];
    return winPatterns.some(pattern => pattern.every(idx => board[idx] === player));
}

/**
 * Checks if a player has won on a given board state
 * Similar to checkWin but works on any board array
 * @param {Array} boardState - The board state to check
 * @param {string} player - The player symbol to check for ('X' or 'O')
 * @returns {boolean} - True if the player has won, false otherwise
 */
function checkWinOnBoard(boardState, player) {
    const winPatterns = [
        [0,1,2],[3,4,5],[6,7,8], // rows
        [0,3,6],[1,4,7],[2,5,8], // cols
        [0,4,8],[2,4,6]          // diags
    ];
    return winPatterns.some(pattern => pattern.every(idx => boardState[idx] === player));
}

/**
 * Switches between game screens (title screen and game screen)
 * @param {string} screenId - The ID of the screen to show ('titleScreen' or 'gameScreen')
 */
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

/**
 * Starts a new game with the selected mode
 * @param {string} selectedMode - The game mode ('1p' for 1 player, '2p' for 2 players)
 */
function startGame(selectedMode) {
    mode = selectedMode;
    initBoard();
    showScreen('gameScreen');
}

/* ----- Event Listeners ----- */

// Reset button resets the current game
resetBtn.addEventListener('click', initBoard);

// Back button returns to the title screen
backBtn.addEventListener('click', () => {
    showScreen('titleScreen');
});

// One player button starts a game against the AI
onePlayerBtn.addEventListener('click', () => {
    startGame('1p');
});

// Two player button starts a game for two human players
twoPlayerBtn.addEventListener('click', () => {
    startGame('2p');
});

/* ----- Initialize the game ----- */
// Start by showing the title screen
showScreen('titleScreen');
