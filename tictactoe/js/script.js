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
    // Ignore clicks if game is over or cell is already filled
    if (!gameActive || board[idx]) return;

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
        statusElement.textContent = `Player O's turn`;
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
 * Computer makes a move
 * Implements strategy with the following priorities:
 * 1. Win if possible
 * 2. Block player from winning
 * 3. Take center
 * 4. Take corners
 * 5. Take edges
 */

function aiMove() {
    // Don't move if the game is already over
    if (!gameActive) return;

    // Get all empty cells
    const emptyCells = board.map((cell, idx) => cell === '' ? idx : null).filter(idx => idx !== null);
    if (emptyCells.length === 0) return;

    // Strategy 1: Check if computer can win in the next move
    const winMove = findWinningMove('O');
    if (winMove !== null) {
        makeMove(winMove, 'O');
    }
    // Strategy 2: Check if player can win in the next move and block it
    else {
        const blockMove = findWinningMove('X');
        if (blockMove !== null) {
            makeMove(blockMove, 'O');
        }
        // Strategy 3: Try to take the center if it's available
        else if (board[4] === '') {
            makeMove(4, 'O');
        }
        // Strategy 4: Try to take the corners
        else {
            const corners = [0, 2, 6, 8].filter(idx => board[idx] === '');
            if (corners.length > 0) {
                // Choose a random corner
                makeMove(corners[Math.floor(Math.random() * corners.length)], 'O');
            }
            // Strategy 5: Take any available edge
            else {
                const edges = [1, 3, 5, 7].filter(idx => board[idx] === '');
                // Choose a random edge
                makeMove(edges[Math.floor(Math.random() * edges.length)], 'O');
            }
        }
    }

    // Check if computer won
    if (checkWin('O')) {
        statusElement.textContent = `Player O wins!`;
        gameActive = false;
        return;
    }

    // Check if the game is a draw
    else if (board.every(cell => cell)) {
        statusElement.textContent = "It's a draw!";
        gameActive = false;
        return;
    }

    // Return control to the player
    currentPlayer = 'X';
    statusElement.textContent = `Player X's turn`;
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
 * Finds a winning move for a player
 * Checks if a player can win in one move by having 2 out of 3 cells in a row
 * @param {string} player - The player symbol to find a winning move for ('X' or 'O')
 * @returns {number|null} - The index of the winning move, or null if no winning move exists
 */

function findWinningMove(player) {
    const winPatterns = [
        [0,1,2],[3,4,5],[6,7,8], // rows
        [0,3,6],[1,4,7],[2,5,8], // cols
        [0,4,8],[2,4,6]          // diags
    ];

    // Look for a winning pattern where player already has 2 cells and the 3rd is empty
    for (let pattern of winPatterns) {
        const playerCells = pattern.filter(idx => board[idx] === player);
        const emptyCells = pattern.filter(idx => board[idx] === '');

        if (playerCells.length === 2 && emptyCells.length === 1) {
            // Found a potential winning move
            return emptyCells[0];
        }
    }

    return null; // No winning move found
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
