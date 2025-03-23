let board = [];
let currentPlayer = 'X';
let gridSize = 3;
let matchLength = 3;
let gameActive = true;
let scores = { X: 0, O: 0 };
let usedCells = new Set(); // Track used cells


const gameBoard = document.getElementById('gameBoard');
const statusDisplay = document.getElementById('status');
const gridSizeInput = document.getElementById('gridSize');
const matchLengthInput = document.getElementById('matchLength');
const scoreX = document.getElementById('scoreX');
const scoreO = document.getElementById('scoreO');

const gameContainer = document.querySelector('.game-container');
const settingsContainer = document.querySelector('.container');

function initializeGame() {
    gridSize = parseInt(gridSizeInput.value);
    matchLength = parseInt(matchLengthInput.value);
    gameActive = true;
    currentPlayer = 'X';
    scores = { X: 0, O: 0 };
    usedCells = new Set();
    board = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
    
    // Switch views
    settingsContainer.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    
    renderBoard();
    updateScores();
    
    // Hide status display completely
    statusDisplay.style.display = 'none';
    
    if (gridSize > 8) {
        gameContainer.classList.add('large-grid');
    } else {
        gameContainer.classList.remove('large-grid');
    }
    
    document.querySelectorAll('.match-line').forEach(line => line.remove());
}

// Add event listeners for both buttons
document.getElementById('playAI').addEventListener('click', () => {
    isAIMode = true;
    initializeGame();
});

document.getElementById('startGame').addEventListener('click', () => {
    isAIMode = false;
    initializeGame();
});

function updateScores() {
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
}

function renderBoard() {
    gameBoard.innerHTML = '';
    
    // Calculate cell size based on viewport dimensions
    const viewportWidth = window.innerWidth * 0.85; // Increased to 85% of viewport width
    const viewportHeight = window.innerHeight * 0.65; // Increased to 65% to make cells bigger
    
    // Determine the limiting dimension
    const maxCellWidth = viewportWidth / gridSize;
    const maxCellHeight = viewportHeight / gridSize;
    const cellSize = Math.min(maxCellWidth, maxCellHeight, 100); // Increased max cell size to 100px
    
    // Set the board dimensions
    gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, ${cellSize}px)`;
    gameBoard.style.gridTemplateRows = `repeat(${gridSize}, ${cellSize}px)`;
    
    // Center the board in the viewport with margin-top
    gameBoard.style.margin = '0 auto';
    gameBoard.style.position = 'absolute';
    gameBoard.style.top = '40%'; // Adjusted to center vertically
    gameBoard.style.left = '50%';
    gameBoard.style.transform = 'translate(-50%, -50%)';
    
    // Position status and scores closer to the board
    statusDisplay.style.position = 'absolute';
    statusDisplay.style.bottom = '20%'; // Adjusted to be closer to the board
    statusDisplay.style.left = '50%';
    statusDisplay.style.transform = 'translateX(-50%)';
    statusDisplay.style.width = '80%';
    statusDisplay.style.maxWidth = '500px';
    statusDisplay.style.maxWidth = '500px';
    
    // Rest of the function remains the same
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            if (board[i][j]) {
                cell.classList.add(board[i][j].toLowerCase());
            }
            
            cell.addEventListener('click', handleCellClick);
            gameBoard.appendChild(cell);
        }
    }
}

// Add window resize handler
window.addEventListener('resize', () => {
    if (gameContainer.classList.contains('hidden') === false) {
        renderBoard();
    }
});

let isAIMode = false;

// Add event listener for AI mode button
document.getElementById('playAI').addEventListener('click', () => {
    isAIMode = true;
    initializeGame();
});

// Modify the existing start game listener
document.getElementById('startGame').addEventListener('click', () => {
    isAIMode = false;
    initializeGame();
});

// Modify the handleCellClick function to include AI move
function handleCellClick(event) {
    if (!gameActive) return;
    
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    
    if (board[row][col] !== null) return;
    
    makeMove(row, col);
    
    if (isAIMode && gameActive && currentPlayer === 'O') {
        setTimeout(makeAIMove, 200); // Add slight delay for AI move
    }
}

function makeMove(row, col, clickEvent = null) {
    board[row][col] = currentPlayer;
    
    // Update the cell's visual appearance
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
        cell.classList.add(currentPlayer.toLowerCase());
    }
    
    const matches = checkWin(row, col);
    if (matches > 0) {
        scores[currentPlayer] += matches;
        updateScores();
        // Remove status display update
    }
    
    if (checkDraw()) {
        endGame();
        return;
    }
    
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    // Remove status display update
}

function makeAIMove() {
    // Enhanced AI that makes strategic moves
    
    // 1. Try to find a winning move
    const winningMove = findBestMove('O');
    if (winningMove) {
        const [row, col] = winningMove;
        makeMove(row, col);
        return;
    }
    
    // 2. Try to block opponent's winning move
    const blockingMove = findBestMove('X');
    if (blockingMove) {
        const [row, col] = blockingMove;
        makeMove(row, col);
        return;
    }
    
    // 3. Try to make a strategic move
    const strategicMove = findStrategicMove();
    if (strategicMove) {
        const [row, col] = strategicMove;
        makeMove(row, col);
        return;
    }
    
    // 4. Fallback to random move if no better option
    let emptyCells = [];
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (board[i][j] === null) {
                emptyCells.push([i, j]);
            }
        }
    }
    
    if (emptyCells.length > 0) {
        const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        makeMove(row, col);
    }
}

// Helper function to find the best move for a player
function findBestMove(player) {
    // Check each empty cell to see if it would create a match
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (board[i][j] === null) {
                // Temporarily place the symbol
                board[i][j] = player;
                
                // Check if this creates a match
                if (wouldCreateMatch(i, j, player)) {
                    // Undo the move
                    board[i][j] = null;
                    return [i, j];
                }
                
                // Undo the move
                board[i][j] = null;
            }
        }
    }
    return null;
}

// Check if a move would create a match
function wouldCreateMatch(row, col, player) {
    // Check all directions
    return (
        checkPotentialDirection(row, col, 1, 0, player) ||  // Vertical
        checkPotentialDirection(row, col, 0, 1, player) ||  // Horizontal
        checkPotentialDirection(row, col, 1, 1, player) ||  // Diagonal down-right
        checkPotentialDirection(row, col, 1, -1, player)    // Diagonal down-left
    );
}

// Check a specific direction for potential matches
function checkPotentialDirection(row, col, rowDir, colDir, player) {
    let count = 1;
    let cellsInMatch = [[row, col]];
    
    // Check in positive direction
    let i = row + rowDir;
    let j = col + colDir;
    while (i >= 0 && i < gridSize && j >= 0 && j < gridSize && 
           (board[i][j] === player || (i === row && j === col)) && 
           !usedCells.has(`${i},${j}`)) {
        count++;
        cellsInMatch.push([i, j]);
        i += rowDir;
        j += colDir;
    }
    
    // Check in negative direction
    i = row - rowDir;
    j = col - colDir;
    while (i >= 0 && i < gridSize && j >= 0 && j < gridSize && 
           (board[i][j] === player || (i === row && j === col)) && 
           !usedCells.has(`${i},${j}`)) {
        count++;
        cellsInMatch.unshift([i, j]);
        i -= rowDir;
        j -= colDir;
    }
    
    // Return true if we have enough consecutive symbols for a match
    return count >= matchLength;
}

// Find a strategic move (center, corners, or adjacent to existing pieces)
function findStrategicMove() {
    const center = Math.floor(gridSize / 2);
    
    // 1. Try center if available (good for odd-sized grids)
    if (gridSize % 2 === 1 && board[center][center] === null) {
        return [center, center];
    }
    
    // 2. Try corners
    const corners = [
        [0, 0], [0, gridSize-1], 
        [gridSize-1, 0], [gridSize-1, gridSize-1]
    ];
    
    for (const [r, c] of corners) {
        if (board[r][c] === null) {
            return [r, c];
        }
    }
    
    // 3. Try to play adjacent to opponent's pieces
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (board[i][j] === 'X') {
                // Check adjacent cells
                const adjacentCells = [
                    [i-1, j], [i+1, j], [i, j-1], [i, j+1],
                    [i-1, j-1], [i-1, j+1], [i+1, j-1], [i+1, j+1]
                ];
                
                for (const [r, c] of adjacentCells) {
                    if (r >= 0 && r < gridSize && c >= 0 && c < gridSize && board[r][c] === null) {
                        return [r, c];
                    }
                }
            }
        }
    }
    
    // 4. Try to find a cell that could lead to a future match
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (board[i][j] === null && hasPotential(i, j)) {
                return [i, j];
            }
        }
    }
    
    return null;
}

// Check if a cell has potential for future matches
function hasPotential(row, col) {
    // Count empty spaces in each direction
    const directions = [
        [1, 0], [0, 1], [1, 1], [1, -1]  // Vertical, Horizontal, Diagonal down-right, Diagonal down-left
    ];
    
    for (const [rowDir, colDir] of directions) {
        let emptyCount = 1; // Count the current cell
        
        // Check in positive direction
        let i = row + rowDir;
        let j = col + colDir;
        while (i >= 0 && i < gridSize && j >= 0 && j < gridSize && 
               (board[i][j] === null || board[i][j] === 'O') && 
               !usedCells.has(`${i},${j}`)) {
            emptyCount++;
            i += rowDir;
            j += colDir;
        }
        
        // Check in negative direction
        i = row - rowDir;
        j = col - colDir;
        while (i >= 0 && i < gridSize && j >= 0 && j < gridSize && 
               (board[i][j] === null || board[i][j] === 'O') && 
               !usedCells.has(`${i},${j}`)) {
            emptyCount++;
            i -= rowDir;
            j -= colDir;
        }
        
        // If there's enough space for a potential match
        if (emptyCount >= matchLength) {
            return true;
        }
    }
    
    return false;
}

function checkWin(row, col) {
    let totalMatches = 0;
    
    // Check all directions and count matches
    totalMatches += checkDirection(row, col, 1, 0);  // Vertical
    totalMatches += checkDirection(row, col, 0, 1);  // Horizontal
    totalMatches += checkDirection(row, col, 1, 1);  // Diagonal down-right
    totalMatches += checkDirection(row, col, 1, -1); // Diagonal down-left
    
    return totalMatches;
}

// Add to your existing script.js file

// Add a function to draw lines for matches
function drawMatchLine(cells, player) {
    // Create a line element
    const line = document.createElement('div');
    line.classList.add('match-line');
    
    // Add player-specific class for color
    line.classList.add(player.toLowerCase() + '-line');
    
    // Get positions of first and last cell
    const firstCell = document.querySelector(`[data-row="${cells[0][0]}"][data-col="${cells[0][1]}"]`);
    const lastCell = document.querySelector(`[data-row="${cells[cells.length-1][0]}"][data-col="${cells[cells.length-1][1]}"]`);
    
    // Get positions
    const firstRect = firstCell.getBoundingClientRect();
    const lastRect = lastCell.getBoundingClientRect();
    const boardRect = gameBoard.getBoundingClientRect();
    
    // Calculate positions relative to the game board
    const x1 = firstRect.left - boardRect.left + (firstRect.width/2);
    const y1 = firstRect.top - boardRect.top + (firstRect.height/2);
    const x2 = lastRect.left - boardRect.left + (lastRect.width/2);
    const y2 = lastRect.top - boardRect.top + (lastRect.height/2);
    
    // Calculate length and angle
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    
    // Calculate extension amount (about 20% of a cell width)
    const extension = firstRect.width * 0.2;
    
    // Calculate extended length and position adjustments
    const totalLength = length + (extension * 2);
    
    // Special handling for perfectly horizontal and vertical lines
    const isHorizontal = Math.abs(angle) < 1 || Math.abs(angle - 180) < 1;
    const isVertical = Math.abs(angle - 90) < 1 || Math.abs(angle + 90) < 1;
    
    let dx, dy;
    
    if (isHorizontal) {
        // For horizontal lines
        dx = extension * (angle < 90 ? 1 : -1);
        // Add a small vertical offset to better center horizontal lines
        dy = firstRect.height * 0.05; // Small downward adjustment
    } else if (isVertical) {
        // For vertical lines
        dx = 0;
        dy = extension * (angle > 0 ? 1 : -1);
    } else {
        // For diagonal lines
        dx = extension * Math.cos(angle * Math.PI / 180);
        dy = extension * Math.sin(angle * Math.PI / 180);
    }
    
    // Set line properties with extension
    line.style.width = `${totalLength}px`;
    line.style.left = `${x1 - dx}px`;
    line.style.top = `${y1 - dy}px`;
    line.style.transform = `rotate(${angle}deg)`;
    line.style.transformOrigin = 'left center';
    
    // Add gradient for opacity effect - more opaque at ends, slightly transparent in middle
    const playerColor = player === 'X' ? '#3498db' : '#e74c3c';
    line.style.background = `linear-gradient(to right, 
                             ${playerColor} 0%, 
                             ${playerColor} 20%, 
                             ${playerColor}80 50%, 
                             ${playerColor} 80%, 
                             ${playerColor} 100%)`;
    
    // Add line to game board
    gameBoard.appendChild(line);
    
    // Add window resize handler to update line positions
    const updateLinePosition = () => {
        // Recalculate positions after resize
        const updatedFirstRect = firstCell.getBoundingClientRect();
        const updatedLastRect = lastCell.getBoundingClientRect();
        const updatedBoardRect = gameBoard.getBoundingClientRect();
        
        const newX1 = updatedFirstRect.left - updatedBoardRect.left + (updatedFirstRect.width/2);
        const newY1 = updatedFirstRect.top - updatedBoardRect.top + (updatedFirstRect.height/2);
        const newX2 = updatedLastRect.left - updatedBoardRect.left + (updatedLastRect.width/2);
        const newY2 = updatedLastRect.top - updatedBoardRect.top + (updatedLastRect.height/2);
        
        const newLength = Math.sqrt(Math.pow(newX2 - newX1, 2) + Math.pow(newY2 - newY1, 2));
        const newAngle = Math.atan2(newY2 - newY1, newX2 - newX1) * 180 / Math.PI;
        
        const newExtension = updatedFirstRect.width * 0.2;
        const newTotalLength = newLength + (newExtension * 2);
        
        // Special handling for perfectly horizontal and vertical lines
        const newIsHorizontal = Math.abs(newAngle) < 1 || Math.abs(newAngle - 180) < 1;
        const newIsVertical = Math.abs(newAngle - 90) < 1 || Math.abs(newAngle + 90) < 1;
        
        let newDx, newDy;
        
        if (newIsHorizontal) {
            // For horizontal lines
            newDx = newExtension * (newAngle < 90 ? 1 : -1);
            // Add a small vertical offset to better center horizontal lines
            newDy = updatedFirstRect.height * 0.05; // Small downward adjustment
        } else if (newIsVertical) {
            // For vertical lines
            newDx = 0;
            newDy = newExtension * (newAngle > 0 ? 1 : -1);
        } else {
            // For diagonal lines
            newDx = newExtension * Math.cos(newAngle * Math.PI / 180);
            newDy = newExtension * Math.sin(newAngle * Math.PI / 180);
        }
        
        line.style.width = `${newTotalLength}px`;
        line.style.left = `${newX1 - newDx}px`;
        line.style.top = `${newY1 - newDy}px`;
        line.style.transform = `rotate(${newAngle}deg)`;
    };
    
    // Add the event listener
    window.addEventListener('resize', updateLinePosition);
    
    // Store the event listener reference on the line element for potential cleanup
    line.updatePosition = updateLinePosition;
}

// Modify the checkDirection function to return cells in match
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

function checkDraw() {
    return board.flat().every(cell => cell !== null);
}

function endGame() {
    gameActive = false;
    
    // Add game-over class to hide the status display
    gameContainer.classList.add('game-over');
    
    let winner = 'It\'s a tie!';
    if (scores.X > scores.O) {
        winner = 'Player X wins!';
    } else if (scores.O > scores.X) {
        winner = 'Player O wins!';
    }
    
    // Create popup overlay
    const popup = document.createElement('div');
    popup.classList.add('game-popup');
    
    // Create popup content
    const popupContent = document.createElement('div');
    popupContent.classList.add('popup-content');
    
    // Add game results to popup
    const resultTitle = document.createElement('h2');
    resultTitle.textContent = 'Game Over!';
    
    const resultMessage = document.createElement('p');
    resultMessage.textContent = winner;
    
    const scoreInfo = document.createElement('div');
    scoreInfo.classList.add('popup-scores');
    scoreInfo.innerHTML = `
        <div class="popup-score x-score">Player X: ${scores.X}</div>
        <div class="popup-score o-score">Player O: ${scores.O}</div>
    `;
    
    // Create Play Again button
    const playAgainButton = document.createElement('button');
    playAgainButton.textContent = 'Play Again';
    playAgainButton.id = 'playAgainButton';
    playAgainButton.classList.add('play-again-btn');
    playAgainButton.addEventListener('click', () => {
        // Remove popup
        document.body.removeChild(popup);
        resetGame();
    });
    
    // Assemble popup
    popupContent.appendChild(resultTitle);
    popupContent.appendChild(resultMessage);
    popupContent.appendChild(scoreInfo);
    popupContent.appendChild(playAgainButton);
    popup.appendChild(popupContent);
    
    // Add popup to body
    document.body.appendChild(popup);
    
    // Update status display
    statusDisplay.textContent = `Game Over! ${winner} Final Scores - X: ${scores.X}, O: ${scores.O}`;
}

// Add a function to reset the game
function resetGame() {
    // Reset the game with the same settings
    gameActive = true;
    currentPlayer = 'X';
    usedCells = new Set();
    board = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
    
    // Clear the board visually
    renderBoard();
    
    // Keep status display hidden
    statusDisplay.style.display = 'none';
    
    // Remove any match lines
    document.querySelectorAll('.match-line').forEach(line => line.remove());
}


// Custom number input handlers
// Add this near the beginning of your script.js file
document.addEventListener('DOMContentLoaded', function() {
    // Set up number input controls
    document.querySelectorAll('.increase').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.closest('.number-input-container').querySelector('input');
            const currentValue = parseInt(input.value);
            if (currentValue < parseInt(input.max)) {
                input.value = currentValue + 1;
            }
        });
    });
    
    document.querySelectorAll('.decrease').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.closest('.number-input-container').querySelector('input');
            const currentValue = parseInt(input.value);
            if (currentValue > parseInt(input.min)) {
                input.value = currentValue - 1;
            }
        });
    });
});


// Add this to ensure the game is responsive on load and resize
window.addEventListener('resize', function() {
    if (gridSize > 8) {
        document.querySelector('.container').classList.add('large-grid');
    }
});
