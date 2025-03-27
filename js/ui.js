// Render the game board
function renderBoard() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    // Calculate cell size based on viewport dimensions
    const viewportWidth = window.innerWidth * 0.85;
    const viewportHeight = window.innerHeight * 0.65;
    
    // Determine the limiting dimension
    const maxCellWidth = viewportWidth / gridSize;
    const maxCellHeight = viewportHeight / gridSize;
    const cellSize = Math.min(maxCellWidth, maxCellHeight, 100);
    
    // Set the board dimensions
    gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, ${cellSize}px)`;
    gameBoard.style.gridTemplateRows = `repeat(${gridSize}, ${cellSize}px)`;
    
    // Center the board in the viewport properly
    gameBoard.style.margin = '0 auto';
    gameBoard.style.position = 'absolute';
    
    // Move the board up based on grid size
    if (gridSize >= 12) {
        gameBoard.style.top = 'calc(40% - 35px)';
    } else {
        gameBoard.style.top = '40%';
    }
    
    gameBoard.style.left = '50%';
    gameBoard.style.transform = 'translate(-50%, -50%)';
    
    // Ensure the game container is properly centered on mobile
    const gameContainer = document.querySelector('.game-container');
    gameContainer.style.padding = '20px 0'; // Remove horizontal padding
    gameContainer.style.width = '100%';
    gameContainer.style.left = '0'; // Reset any left positioning
    
    // Create or update the turn indicator
    let turnIndicator = document.getElementById('turnIndicator');
    if (!turnIndicator) {
        turnIndicator = document.createElement('div');
        turnIndicator.id = 'turnIndicator';
        turnIndicator.classList.add('turn-indicator');
        gameContainer.appendChild(turnIndicator);
    }
    
    // Position turn indicator above scores
    turnIndicator.style.position = 'absolute';
    turnIndicator.style.bottom = 'calc(10% + 60px)'; // Position above scores
    turnIndicator.style.left = '50%';
    turnIndicator.style.transform = 'translateX(-50%)';
    turnIndicator.style.width = '80%'; // Match width with scores
    turnIndicator.style.textAlign = 'center';
    turnIndicator.style.padding = '10px';
    turnIndicator.style.borderRadius = '8px';
    turnIndicator.style.backgroundColor = 'rgba(15, 23, 42, 0.5)';
    turnIndicator.style.border = '1px solid rgba(255, 255, 255, 0.05)';
    turnIndicator.style.color = currentPlayer === 'X' ? '#6366f1' : '#ef4444';
    turnIndicator.style.fontWeight = 'bold';
    turnIndicator.textContent = `Current Turn: ${playerNames[currentPlayer]}`;
    
    // Position scores
    const scoresElement = document.getElementById('scores');
    if (scoresElement) {
        scoresElement.style.position = 'absolute';
        scoresElement.style.bottom = '10%'; // Adjusted position
        scoresElement.style.left = '50%';
        scoresElement.style.transform = 'translateX(-50%)';
        scoresElement.style.marginTop = '10px';
        scoresElement.style.width = '80%'; // Control width for better mobile display
    }
    
    // Create cells
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

// Show player name modal
function showPlayerNameModal() {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.classList.add('player-name-modal');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    // Add opacity animation for fade-in effect
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.4s ease-in-out';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');
    modalContent.style.backgroundColor = '#1e293b';
    modalContent.style.padding = '30px';
    modalContent.style.borderRadius = '10px';
    modalContent.style.width = '90%';
    modalContent.style.maxWidth = '400px';
    modalContent.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
    modalContent.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    // Add transform animation for scale effect
    modalContent.style.transform = 'scale(0.8)';
    modalContent.style.transition = 'transform 0.4s ease-out';
    
    // Create title
    const title = document.createElement('h2');
    title.textContent = isAIMode ? 'Enter Your Name' : 'Enter Player Names';
    title.style.color = '#e2e8f0';
    title.style.marginBottom = '20px';
    title.style.textAlign = 'center';
    
    // Create form
    const form = document.createElement('form');
    form.id = 'playerNameForm';
    form.style.display = 'flex';
    form.style.flexDirection = 'column';
    form.style.gap = '15px';
    
    // Player X input
    const playerXLabel = document.createElement('label');
    playerXLabel.textContent = isAIMode ? 'Your Name:' : 'Player X:';
    playerXLabel.style.color = '#6366f1';
    playerXLabel.style.fontWeight = 'bold';
    playerXLabel.style.marginBottom = '0px';
    playerXLabel.style.display = 'inline-block';
    
    const playerXInput = document.createElement('input');
    playerXInput.type = 'text';
    playerXInput.id = 'playerXName';
    playerXInput.placeholder = 'Player X';
    playerXInput.style.padding = '10px';
    playerXInput.style.borderRadius = '5px';
    playerXInput.style.backgroundColor = '#334155';
    playerXInput.style.border = '1px solid #475569';
    playerXInput.style.color = '#e2e8f0';
    playerXInput.style.marginTop = '2px';
    
    // Only show Player O input if not in AI mode
    let playerOLabel, playerOInput;
    if (!isAIMode) {
        playerOLabel = document.createElement('label');
        playerOLabel.textContent = 'Player O:';
        playerOLabel.style.color = '#ef4444';
        playerOLabel.style.fontWeight = 'bold';
        playerOLabel.style.marginBottom = '0px';
        playerOLabel.style.display = 'inline-block';
        
        playerOInput = document.createElement('input');
        playerOInput.type = 'text';
        playerOInput.id = 'playerOName';
        playerOInput.placeholder = 'Player O';
        playerOInput.style.padding = '10px';
        playerOInput.style.borderRadius = '5px';
        playerOInput.style.backgroundColor = '#334155';
        playerOInput.style.border = '1px solid #475569';
        playerOInput.style.color = '#e2e8f0';
        playerOInput.style.marginTop = '0px';
    }
    
    // Submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Start Game';
    submitButton.style.padding = '12px';
    submitButton.style.marginTop = '10px';
    submitButton.style.backgroundColor = '#10b981';
    submitButton.style.color = 'white';
    submitButton.style.border = 'none';
    submitButton.style.borderRadius = '5px';
    submitButton.style.cursor = 'pointer';
    submitButton.style.fontWeight = 'bold';
    submitButton.style.transition = 'background-color 0.3s, transform 0.2s';

    // Add hover effect to button
    submitButton.addEventListener('mouseover', () => {
        submitButton.style.backgroundColor = '#059669';
        submitButton.style.transform = 'scale(1.05)';
    });
    
    submitButton.addEventListener('mouseout', () => {
        submitButton.style.backgroundColor = '#10b981';
        submitButton.style.transform = 'scale(1)';
    });
    
    // Assemble form
    form.appendChild(playerXLabel);
    form.appendChild(playerXInput);
    if (!isAIMode) {
        form.appendChild(playerOLabel);
        form.appendChild(playerOInput);
    }
    form.appendChild(submitButton);
    
    // Assemble modal
    modalContent.appendChild(title);
    modalContent.appendChild(form);
    modal.appendChild(modalContent);
    
    // Add form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get player names, use defaults if empty
        const xName = playerXInput.value.trim() || 'Player X';
        const oName = isAIMode ? 'AI' : (playerOInput ? playerOInput.value.trim() : 'Player O');
        
        // Store player names
        playerNames = {
            X: xName,
            O: oName
        };
        
        // Add exit animation
        modal.style.opacity = '0';
        modalContent.style.transform = 'scale(0.8)';
        
        // Remove modal after animation completes
        setTimeout(() => {
            document.body.removeChild(modal);
            // Start the game
            initializeGame();
            
            // If in AI mode and it's AI's turn (O), make a move
            if (isAIMode && currentPlayer === 'O') {
                setTimeout(makeAIMove, 500);
            }
        }, 300);
    });
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Trigger entrance animation after a small delay
    setTimeout(() => {
        modal.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
    }, 10);
    
    // Focus on first input
    playerXInput.focus();
}

// Handle cell click
function handleCellClick(event) {
    if (!gameActive) return;
    
    // Normal gameplay for both AI and non-AI mode
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    
    if (board[row][col] !== null) return;
    
    // Make the player's move
    makeMove(row, col);
    
    // If in AI mode and game is still active, make AI move after a short delay
    if (isAIMode && gameActive && currentPlayer === 'O') {
        setTimeout(makeAIMove, 500);
    }
}

// Draw match line
function drawMatchLine(cells, player) {
    const gameBoard = document.getElementById('gameBoard');
    
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

// End game and show results
function endGame() {
    gameActive = false;
    
    // Add game-over class to hide the status display
    document.querySelector('.game-container').classList.add('game-over');
    
    let winner = 'It\'s a tie!';
    if (scores.X > scores.O) {
        winner = `${playerNames.X} wins!`;
    } else if (scores.O > scores.X) {
        winner = `${playerNames.O} wins!`;
    }

    // Update score info with player names
    const scoreInfo = document.createElement('div');
    scoreInfo.classList.add('popup-scores');
    scoreInfo.innerHTML = `
        <div class="popup-score x-score">${playerNames.X}: ${scores.X}</div>
        <div class="popup-score o-score">${playerNames.O}: ${scores.O}</div>
    `;
    
    // Create popup overlay
    const popup = document.createElement('div');
    popup.classList.add('game-popup');
    popup.id = 'gameOverPopup';
    
    // Create popup content
    const popupContent = document.createElement('div');
    popupContent.classList.add('popup-content');
    popupContent.style.position = 'relative'; // Ensure proper positioning for the close button
    
    // Add close button to the popup content
    const closeButton = document.createElement('div');
    closeButton.classList.add('popup-close');
    closeButton.innerHTML = '&times;';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '15px';
    closeButton.style.fontSize = '24px';
    closeButton.style.fontWeight = 'bold';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#cbd5e1';
    closeButton.style.zIndex = '1001'; // Ensure it's above other popup content
    closeButton.addEventListener('click', () => {
        document.body.removeChild(popup);
        showPlayAgainButton();
    });
    
    // Add game results to popup
    const resultTitle = document.createElement('h2');
    resultTitle.textContent = 'Game Over!';
    
    const resultMessage = document.createElement('p');
    resultMessage.textContent = winner;
    
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
    popupContent.appendChild(closeButton);
    popupContent.appendChild(resultTitle);
    popupContent.appendChild(resultMessage);
    popupContent.appendChild(scoreInfo);
    popupContent.appendChild(playAgainButton);
    popup.appendChild(popupContent);
    
    // Add popup to body
    document.body.appendChild(popup);
    
    // Update status display
    const statusDisplay = document.getElementById('status');
    statusDisplay.textContent = `Game Over! ${winner} Final Scores - X: ${scores.X}, O: ${scores.O}`;
}

// Function to show the Play Again button above the turn indicator
function showPlayAgainButton() {
    let playAgainFloating = document.getElementById('playAgainFloating');
    
    if (!playAgainFloating) {
        playAgainFloating = document.createElement('button');
        playAgainFloating.id = 'playAgainFloating';
        playAgainFloating.textContent = 'Play Again';
        playAgainFloating.classList.add('play-again-btn');
        
        // Style the floating button
        playAgainFloating.style.position = 'absolute';
        playAgainFloating.style.bottom = 'calc(10% + 120px)';
        playAgainFloating.style.left = '50%';
        playAgainFloating.style.transform = 'translateX(-50%)';
        playAgainFloating.style.zIndex = '200';
        playAgainFloating.style.width = '150px'; // Reduced width
        playAgainFloating.style.minWidth = 'auto'; // Override any minimum width
        
        playAgainFloating.addEventListener('click', resetGame);
        document.querySelector('.game-container').appendChild(playAgainFloating);
    } else {
        playAgainFloating.style.display = 'block';
    }
}

// Function to return to the main menu
function returnToMainMenu() {
    // Hide game container and show settings container
    document.querySelector('.game-container').classList.add('hidden');
    document.querySelector('.container').classList.remove('hidden');
    
    // Reset scores
    scores = { X: 0, O: 0 };
    updateScores();
    
    // Remove any match lines
    document.querySelectorAll('.match-line').forEach(line => {
        if (line.updatePosition) {
            window.removeEventListener('resize', line.updatePosition);
        }
        line.remove();
    });
    
    // Remove turn indicator if it exists
    const turnIndicator = document.getElementById('turnIndicator');
    if (turnIndicator) {
        turnIndicator.remove();
    }
    
    // Remove floating play again button if it exists
    const playAgainFloating = document.getElementById('playAgainFloating');
    if (playAgainFloating) {
        playAgainFloating.remove();
    }
    
    // Reset game state
    gameActive = false;
    currentPlayer = 'X';
    board = [];
    usedCells = new Set();
}

// Add a back button to return to main menu
function addBackButton() {
    let backButton = document.getElementById('backToMenu');
    
    if (!backButton) {
        backButton = document.createElement('button');
        backButton.id = 'backToMenu';
        backButton.textContent = 'Back to Menu';
        backButton.classList.add('back-button');
        
        // Style the back button
        backButton.style.position = 'absolute';
        backButton.style.top = '10px';
        backButton.style.left = '10px';
        backButton.style.padding = '8px 12px';
        backButton.style.backgroundColor = '#475569';
        backButton.style.color = 'white';
        backButton.style.border = 'none';
        backButton.style.borderRadius = '5px';
        backButton.style.cursor = 'pointer';
        backButton.style.fontWeight = 'bold';
        backButton.style.zIndex = '100';
        
        backButton.addEventListener('click', returnToMainMenu);
        document.querySelector('.game-container').appendChild(backButton);
    }
}