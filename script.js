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
    statusDisplay.textContent = `It's ${currentPlayer}'s turn`;
    
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
    const viewportWidth = window.innerWidth * 0.8; // 80% of viewport width
    const viewportHeight = window.innerHeight * 0.55; // Further reduced to 55% to leave more room below
    
    // Determine the limiting dimension
    const maxCellWidth = viewportWidth / gridSize;
    const maxCellHeight = viewportHeight / gridSize;
    const cellSize = Math.min(maxCellWidth, maxCellHeight, 80); // Max 80px per cell
    
    // Set the board dimensions
    gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, ${cellSize}px)`;
    gameBoard.style.gridTemplateRows = `repeat(${gridSize}, ${cellSize}px)`;
    
    // Center the board in the viewport but position it higher
    gameBoard.style.margin = '0 auto';
    gameBoard.style.position = 'absolute';
    gameBoard.style.top = '35%'; // Move up even more to make room for status below
    gameBoard.style.left = '50%';
    gameBoard.style.transform = 'translate(-50%, -50%)';
    
    // Position status and scores further below the board
    statusDisplay.style.position = 'absolute';
    statusDisplay.style.bottom = '15%'; // Moved up from bottom
    statusDisplay.style.left = '50%';
    statusDisplay.style.transform = 'translateX(-50%)';
    statusDisplay.style.width = '80%';
    statusDisplay.style.maxWidth = '500px';
    
    const scoresElement = document.getElementById('scores');
    scoresElement.style.position = 'absolute';
    scoresElement.style.bottom = '5%'; // Moved up from bottom
    scoresElement.style.left = '50%';
    scoresElement.style.transform = 'translateX(-50%)';
    scoresElement.style.width = '80%';
    scoresElement.style.maxWidth = '500px';
    
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
        setTimeout(makeAIMove, 500); // Add slight delay for AI move
    }
}

function makeMove(row, col) {
    board[row][col] = currentPlayer;
    event.target.classList.add(currentPlayer.toLowerCase());
    
    const matches = checkWin(row, col);
    if (matches > 0) {
        scores[currentPlayer] += matches;
        updateScores();
        statusDisplay.textContent = `Player ${currentPlayer} scored ${matches} point(s)!`;
    }
    
    if (checkDraw()) {
        endGame();
        return;
    }
    
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDisplay.textContent = `It's ${currentPlayer}'s turn`;
}

function makeAIMove() {
    // Simple AI that makes random moves
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
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        makeMove(row, col);
        cell.click();
    }
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
    let winner = 'It\'s a tie!';
    if (scores.X > scores.O) {
        winner = 'Player X wins!';
    } else if (scores.O > scores.X) {
        winner = 'Player O wins!';
    }
    statusDisplay.textContent = `Game Over! ${winner} Final Scores - X: ${scores.X}, O: ${scores.O}`;}


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
