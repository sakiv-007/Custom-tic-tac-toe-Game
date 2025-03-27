// Main script to initialize the game

// Make sure isAIMode is declared globally
let isAIMode = false;

// Add event listeners for both buttons
document.getElementById('playAI').addEventListener('click', function() {
    isAIMode = true;
    showPlayerNameModal();
});

document.getElementById('startGame').addEventListener('click', function() {
    isAIMode = false;
    showPlayerNameModal();
});

// Custom number input handlers
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
    
    // Add back button to game container
    addBackButton();
});

// Add window resize handlers
window.addEventListener('resize', function() {
    if (!document.querySelector('.game-container').classList.contains('hidden')) {
        renderBoard();
    }
    
    if (gridSize > 8) {
        document.querySelector('.container').classList.add('large-grid');
    }
});