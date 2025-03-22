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

document.getElementById('startGame').addEventListener('click', initializeGame);

function initializeGame() {
    gridSize = parseInt(gridSizeInput.value);
    matchLength = parseInt(matchLengthInput.value);
    gameActive = true;
    currentPlayer = 'X';
    scores = { X: 0, O: 0 };
    usedCells = new Set(); // Reset used cells
    board = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
    renderBoard();
    updateScores();
    statusDisplay.textContent = `It's ${currentPlayer}'s turn`;
    
    // Add class for large grids
    if (gridSize > 8) {
        document.querySelector('.container').classList.add('large-grid');
    } else {
        document.querySelector('.container').classList.remove('large-grid');
    }
    
    // Remove any existing match lines
    document.querySelectorAll('.match-line').forEach(line => line.remove());
}

function updateScores() {
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
}

function renderBoard() {
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            // Add class instead of text content if cell is not empty
            if (board[i][j]) {
                cell.classList.add(board[i][j].toLowerCase());
            }
            
            cell.addEventListener('click', handleCellClick);
            gameBoard.appendChild(cell);
        }
    }
}

function handleCellClick(event) {
    if (!gameActive) return;
    
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    
    if (board[row][col] !== null) return;
    
    board[row][col] = currentPlayer;
    
    // Use classes instead of text content
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
    const x1 = firstRect.left + firstRect.width/2 - boardRect.left;
    const y1 = firstRect.top + firstRect.height/2 - boardRect.top;
    const x2 = lastRect.left + lastRect.width/2 - boardRect.left;
    const y2 = lastRect.top + lastRect.height/2 - boardRect.top;
    
    // Calculate length and angle
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    
    // Set line properties
    line.style.width = `${length}px`;
    line.style.left = `${x1}px`;
    line.style.top = `${y1}px`;
    line.style.transform = `rotate(${angle}deg)`;
    line.style.transformOrigin = 'left center';
    
    // Add line to game board
    gameBoard.appendChild(line);
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
    
    if (count >= matchLength) {
        matches = Math.floor(count / matchLength);
        
        // Mark cells as used
        cellsInMatch.forEach(([r, c]) => usedCells.add(`${r},${c}`));
        
        // Draw line for each complete match
        for (let i = 0; i < matches; i++) {
            const start = i * matchLength;
            const matchCells = cellsInMatch.slice(start, start + matchLength);
            drawMatchLine(matchCells, currentPlayer);
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
