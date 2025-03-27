// AI-related functions

// Make an AI move
function makeAIMove() {
    if (!gameActive) return;
    
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
    
    // 4. Fallback to random move
    const randomMove = findRandomMove();
    if (randomMove) {
        const [row, col] = randomMove;
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

// Helper function for random moves
function findRandomMove() {
    let emptyCells = [];
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (board[i][j] === null) {
                emptyCells.push([i, j]);
            }
        }
    }
    return emptyCells.length > 0 ? emptyCells[Math.floor(Math.random() * emptyCells.length)] : null;
}