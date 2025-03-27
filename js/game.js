// Game state variables
let board = [];
let currentPlayer = 'X';
let gridSize = 3;
let matchLength = 3;
let gameActive = true;
let scores = { X: 0, O: 0 };
let usedCells = new Set(); // Track used cells
let playerNames = { X: 'Player X', O: 'Player O' };

// DOM references - make sure these are available globally
const gameBoard = document.getElementById('gameBoard');
const statusDisplay = document.getElementById('status');
const gameContainer = document.querySelector('.game-container');

// Game initialization
function initializeGame() {
    // Get the latest values from inputs
    gridSize = parseInt(document.getElementById('gridSize').value);
    matchLength = parseInt(document.getElementById('matchLength').value);
    
    // Initialize game state
    gameActive = true;
    currentPlayer = 'X';
    scores = { X: 0, O: 0 };
    usedCells = new Set();
    board = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
    
    // Switch views
    document.querySelector('.container').classList.add('hidden');
    gameContainer.classList.remove('hidden');
    
    // Remove any existing match lines
    document.querySelectorAll('.match-line').forEach(line => line.remove());
    
    // Render the board and update scores
    renderBoard();
    updateScores();
    
    // Hide status display completely
    statusDisplay.style.display = 'none';
    
    // Add large-grid class if needed
    if (gridSize > 8) {
        gameContainer.classList.add('large-grid');
    } else {
        gameContainer.classList.remove('large-grid');
    }
    
    // Add back button
    addBackButton();
    
    console.log("Game initialized with grid size:", gridSize, "and match length:", matchLength);
}

// Make a move on the board
function makeMove(row, col) {
    board[row][col] = currentPlayer;
    
    // Remove previous last-move highlight if exists
    const previousLastMove = document.querySelector('.last-move');
    if (previousLastMove) {
        previousLastMove.classList.remove('last-move');
    }
    
    // Update the cell's visual appearance
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
        cell.classList.add(currentPlayer.toLowerCase());
        cell.classList.add('last-move'); // Add last-move class
    }
    
    const matches = checkWin(row, col);
    if (matches > 0) {
        scores[currentPlayer] += matches;
        updateScores();
    }
    
    // Check for game end conditions
    if (checkDraw()) {
        endGame();
        return;
    }
    
    // Check if all cells are used in matches
    const allCellsUsed = board.flat().every(cell => cell !== null || usedCells.has(`${cell}`));
    if (allCellsUsed) {
        endGame();
        return;
    }
    
    // Switch current player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    
    // Update turn indicator with player name
    updateTurnIndicator();
}

// Add this new function to update the turn indicator
function updateTurnIndicator() {
    const turnIndicator = document.getElementById('turnIndicator');
    if (turnIndicator) {
        turnIndicator.style.color = currentPlayer === 'X' ? '#6366f1' : '#ef4444';
        turnIndicator.textContent = `Current Turn: ${playerNames[currentPlayer]}`;
    }
}

// Check for win conditions
function checkWin(row, col) {
    let totalMatches = 0;
    
    // Check all directions and count matches
    totalMatches += checkDirection(row, col, 1, 0);  // Vertical
    totalMatches += checkDirection(row, col, 0, 1);  // Horizontal
    totalMatches += checkDirection(row, col, 1, 1);  // Diagonal down-right
    totalMatches += checkDirection(row, col, 1, -1); // Diagonal down-left
    
    return totalMatches;
}

// Check a specific direction for matches
function checkDirection(row, col, rowDir, colDir) {
    let count = 1;
    let matches = 0;
    let cellsInMatch = [[row, col]];
    
    // Check in positive direction
    let i = row + rowDir;
    let j = col + colDir;
    while (i >= 0 && i < gridSize && j >= 0 && j < gridSize && 
           board[i][j] === currentPlayer && !usedCells.has(`${i},${j}`)) {
        count++;
        cellsInMatch.push([i, j]);
        i += rowDir;
        j += colDir;
    }
    
    // Check in negative direction
    i = row - rowDir;
    j = col - colDir;
    while (i >= 0 && i < gridSize && j >= 0 && j < gridSize && 
           board[i][j] === currentPlayer && !usedCells.has(`${i},${j}`)) {
        count++;
        cellsInMatch.unshift([i, j]); // Add to beginning to maintain order
        i -= rowDir;
        j -= colDir;
    }
    
    // Only count matches if we have enough consecutive symbols
    if (count >= matchLength) {
        matches = Math.floor(count / matchLength);
        
        // Draw line for each complete match
        for (let i = 0; i < matches; i++) {
            const start = i * matchLength;
            const matchCells = cellsInMatch.slice(start, start + matchLength);
            
            // Verify that all cells in this match segment have the current player's symbol
            const allCellsMatch = matchCells.every(([r, c]) => 
                board[r][c] === currentPlayer && !usedCells.has(`${r},${c}`)
            );
            
            if (allCellsMatch) {
                // Mark cells as used only if they form a valid match
                matchCells.forEach(([r, c]) => usedCells.add(`${r},${c}`));
                
                // Draw the match line
                drawMatchLine(matchCells, currentPlayer);
            }
        }
    }
    
    return matches;
}

// Check for draw
function checkDraw() {
    return board.flat().every(cell => cell !== null);
}

// Reset the game
function resetGame() {
    // Reset the game with the same settings
    gameActive = true;
    currentPlayer = 'X';
    usedCells = new Set();
    board = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
    
    // Clear the board visually
    renderBoard();
    
    // Keep status display hidden
    document.getElementById('status').style.display = 'none';
    
    // Remove any match lines
    document.querySelectorAll('.match-line').forEach(line => {
        // Remove any attached event listeners to prevent memory leaks
        if (line.updatePosition) {
            window.removeEventListener('resize', line.updatePosition);
        }
        line.remove();
    });
    
    // Hide the floating Play Again button if it exists
    const playAgainFloating = document.getElementById('playAgainFloating');
    if (playAgainFloating) {
        playAgainFloating.style.display = 'none';
    }
    
    // Remove game-over class
    document.querySelector('.game-container').classList.remove('game-over');
    
    // Update turn indicator with player name
    const turnIndicator = document.getElementById('turnIndicator');
    if (turnIndicator) {
        turnIndicator.style.color = currentPlayer === 'X' ? '#6366f1' : '#ef4444';
        turnIndicator.textContent = `Current Turn: ${playerNames[currentPlayer]}`;
    }
    
    // If in AI mode and it's AI's turn (O), make a move
    if (isAIMode && currentPlayer === 'O') {
        setTimeout(makeAIMove, 500);
    }
}

// Update scores display
function updateScores() {
    document.getElementById('scoreX').textContent = scores.X;
    document.getElementById('scoreO').textContent = scores.O;
}