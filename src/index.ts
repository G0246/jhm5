/**
 * TicTacToe Game Cloudflare Worker
 * Serves a static TicTacToe game with HTML, CSS, and JavaScript
 */

// Import the HTML content
const HTML_CONTENT = `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
    <!-- Basic meta tags for character set and responsive design -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>井字過三關</title>
    <!-- Inline CSS styles -->
    <style>
        /* Apply border-box sizing to all elements for consistent sizing */
        * {
            box-sizing: border-box;
        }

        /* Basic body styling and centering the game container */
        body {
            font-family: Arial, sans-serif;
            background: #f0f0f0;
            /* The following 4 lines center the container vertically and horizontally */
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            color: #333;
        }

        /* Main container styling - holds both screens */
        .container {
            background: #fff;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 5px;
            text-align: center;
            width: 90%;
            max-width: 400px; /* Limit maximum width for larger screens */
        }

        /* Heading styles */
        h1 {
            font-size: 1.8rem;
            margin-bottom: 15px;
            color: #333;
        }

        h2 {
            font-size: 1.3rem;
            margin: 10px 0;
            color: #444;
        }

        /* Screen Management - controls which screen is visible */
        .screen {
            display: none; /* Hide screens by default */
        }

        .screen.active {
            display: block; /* Show only the active screen */
        }

        /* Title Screen Logo */
        .logo {
            margin: 15px auto;
            width: 150px;
            height: 100px;
            border: 1px solid #ccc;
            background-color: #f9f9f9;
            padding: 10px;
        }

        /* Grid layout for the X/O logo on title screen */
        .logo-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr); /* 3 equal columns */
            grid-template-rows: repeat(3, 1fr);    /* 3 equal rows */
            gap: 3px;
            width: 100%;
            height: 100%;
        }

        /* Style for each X/O in the logo grid */
        .logo-grid span {
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 20px;
            font-weight: bold;
            background: #eee;
        }

        /* Different colors for X's and O's in the logo */
        .logo-grid span:nth-child(odd) {
            color: #333; /* X's */
        }

        .logo-grid span:nth-child(even) {
            color: #777; /* O's */
        }

        /* Game mode selection area */
        .mode-select {
            margin: 15px 0;
        }

        /* Game Board - The 3x3 grid */
        .board {
            display: grid;
            grid-template-columns: repeat(3, 60px); /* 3 columns of 60px each */
            grid-template-rows: repeat(3, 60px);    /* 3 rows of 60px each */
            gap: 5px;                               /* Space between cells */
            margin: 15px auto;
            width: max-content;                     /* Only as wide as needed */
        }

        /* Individual cell in the game board */
        .cell {
            width: 60px;
            height: 60px;
            background: #eee;
            font-size: 24px;
            font-weight: bold;
            /* Center X and O in the cell */
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;                        /* Cursor when hover */
            border: 1px solid #ccc;
        }

        /* Highlight effect when hovering over a cell */
        .cell:hover {
            background: #e0e0e0;
        }

        /* Different colors for X and O */
        .cell[data-player="X"] {
            color: blue;
        }

        .cell[data-player="O"] {
            color: red;
        }

        /* Winning cell highlighting */
        .cell.winning-cell {
            background: #4CAF50 !important;      /* Green background for winning cells */
            color: white !important;             /* White text for better contrast */
            animation: pulse 0.8s ease-in-out;     /* Subtle pulse animation */
        }

        /* Pulse animation for winning cells */
        @keyframes pulse {
            0% {
                transform: scale(1);
                box-shadow: 0 0 5px rgba(76, 175, 80, 0.7);
            }
            50% {
                transform: scale(1.05);
                box-shadow: 0 0 15px rgba(76, 175, 80, 0.9);
            }
            100% {
                transform: scale(1);
                box-shadow: 0 0 5px rgba(76, 175, 80, 0.7);
            }
        }

        /* Status message area - shows current player, winner, etc. */
        .status {
            margin: 15px 0;
            font-size: 16px;
            min-height: 20px;
            color: #333;
        }

        /* Container for the control buttons */
        .controls {
            display: flex;
            justify-content: center;                /* Center the buttons horizontally */
            gap: 10px;                              /* Space between buttons */
            margin-top: 15px;
        }

        /* All buttons styling */
        button, .btn {
            padding: 8px 15px;
            font-size: 14px;
            background: #f0f0f0;
            color: #333;
            border: 1px solid #ccc;
            cursor: pointer;
            margin: 5px;
        }

        /* Button hover effect */
        button:hover, .btn:hover {
            background: #e0e0e0;                    /* Slightly darker on hover */
        }

        /* Primary button styling - used for mode selection */
        .btn-primary {
            background: #e0e0e0;
            font-weight: bold;                      /* Make text bolder for emphasis */
        }
    </style>
</head>
<body>
    <!-- Main container that holds all game elements -->
    <div class="container">
        <!-- Title Screen - shown first when game loads -->
        <div id="titleScreen" class="screen active">
            <h1>井字過三關</h1>
            <!-- Very cool logo showing a 3x3 grid of X and O symbols -->
            <div class="logo">
                <div class="logo-grid">
                    <span>X</span>
                    <span>O</span>
                    <span>X</span>
                    <span>O</span>
                    <span>X</span>
                    <span>O</span>
                    <span>O</span>
                    <span>X</span>
                    <span>O</span>
                </div>
            </div>

            <!-- Game mode selection buttons -->
            <div class="mode-select">
                <h2>選擇遊戲模式</h2>
                <button id="onePlayerBtn">單人模式</button>  <!-- Play against AI -->
                <button id="twoPlayerBtn">雙人模式</button> <!-- Play against another person -->
            </div>
        </div>

        <!-- Game Screen - hidden initially, shown after selecting game mode -->
        <div id="gameScreen" class="screen">
            <h1>井字過三關</h1>

            <!-- Game board - will be populated by JavaScript with 9 cells -->
            <div id="gameBoard" class="board"></div>

            <!-- Status message area (shows current player, winner, etc.) -->
            <div id="status" class="status"></div>

            <!-- Control buttons -->
            <div class="controls">
                <button id="resetBtn">重新開始</button> <!-- Restarts the current game -->
                <button id="backBtn">返回目錄</button> <!-- Returns to title screen -->
            </div>
        </div>
    </div>

    <!-- Inline JavaScript -->
    <script>
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
        let mode;           // Game mode: '1p' for 1 player, '2p' for 2 players
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
            statusElement.textContent = \`玩家 \${currentPlayer} 的回合\`;
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
            const winningCells = checkWin(currentPlayer);
            if (winningCells) {
                statusElement.textContent = \`玩家 \${currentPlayer} 獲勝！\`;
                highlightWinningCells(winningCells);
                gameActive = false;
                return;
            }
            // Check if this move resulted in a draw (all cells filled)
            else if (board.every(cell => cell)) {
                statusElement.textContent = "平手！";
                gameActive = false;
                return;
            }

            // Handle next turn based on game mode
            if (mode === '1p' && currentPlayer === 'X') {
                // In 1-player mode after player's move, it's computer's turn
                currentPlayer = 'O';
                isAiThinking = true; // Prevent further clicks
                statusElement.textContent = \`電腦正在思考\`;

                // Delay computer move to make it feel more natural
                setTimeout(aiMove, 700);
            } else {
                // In 2-player mode, or computer just moved in 1-player mode, switch players
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                statusElement.textContent = \`玩家 \${currentPlayer} 的回合\`;
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
            const winningCells = checkWin('O');
            if (winningCells) {
                statusElement.textContent = \`玩家 O 獲勝！\`;
                highlightWinningCells(winningCells);
                gameActive = false;
                isAiThinking = false;
                return;
            }

            // Check if the game is a draw
            else if (board.every(cell => cell)) {
                statusElement.textContent = "平手！";
                gameActive = false;
                isAiThinking = false;
                return;
            }

            // Return control to the player
            currentPlayer = 'X';
            isAiThinking = false; // Allow player clicks again
            statusElement.textContent = \`玩家 X 的回合\`;
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
            if (checkWin(currentBoard, 'X', false)) {
                return { score: -10 }; // Player wins
            } else if (checkWin(currentBoard, 'O', false)) {
                return { score: 10 };  // AI wins
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
         * @param {Array} boardState - The board state to check (use global 'board' for current game)
         * @param {string} player - The player symbol to check for ('X' or 'O')
         * @param {boolean} returnPattern - If true, returns winning pattern array; if false, returns boolean
         * @returns {Array|boolean|null} - Winning pattern array, boolean, or null based on returnPattern parameter
         */
        function checkWin(boardState, player, returnPattern = true) {
            // If boardState is a string (legacy call), shift parameters
            if (typeof boardState === 'string') {
                returnPattern = player !== undefined ? player : true;
                player = boardState;
                boardState = board;
            }

            const winPatterns = [
                [0,1,2],[3,4,5],[6,7,8], // horizontal
                [0,3,6],[1,4,7],[2,5,8], // vertical
                [0,4,8],[2,4,6]          // diagonal
            ];

            for (let pattern of winPatterns) {
                if (pattern.every(idx => boardState[idx] === player)) {
                    return returnPattern ? pattern : true; // Return pattern or boolean based on parameter
                }
            }
            return returnPattern ? null : false; // No win found
        }

        /**
         * Highlights the winning cells by adding a CSS class
         * @param {Array} winningCells - Array of cell indices that form the winning pattern
         */
        function highlightWinningCells(winningCells) {
            const cells = boardElement.querySelectorAll('.cell');
            winningCells.forEach(idx => {
                cells[idx].classList.add('winning-cell');
            });
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
    </script>
</body>
</html>`;

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return new Response(HTML_CONTENT, {
			headers: {
				'Content-Type': 'text/html;charset=UTF-8',
			},
		});
	},
} satisfies ExportedHandler<Env>;
