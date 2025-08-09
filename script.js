document.addEventListener('DOMContentLoaded', () => {
    // Game Controls
    const randomModeBtn = document.getElementById('random-mode-btn');
    const manualModeBtn = document.getElementById('manual-mode-btn');
    const startGameBtn = document.getElementById('start-game-btn');
    const restartBtn = document.getElementById('restart-btn');
    const continueBtn = document.getElementById('continue-btn');
    const exitBtnStart = document.getElementById('exit-btn-start');
    const exitBtnGame = document.getElementById('exit-btn-game');
    const exitBtnEnd = document.getElementById('exit-btn-end');

    // Button Containers
    const inGameButtons = document.getElementById('in-game-buttons');

    // Displays
    const bingoGrid = document.getElementById('bingo-grid');
    const bingoDisplay = document.getElementById('bingo-display');
    const winnerDisplay = document.getElementById('winner-display');
    
    // Sound elements
    const clickSound = document.getElementById('click-sound');
    const markSound = document.getElementById('mark-sound');
    const winSound = document.getElementById('win-sound');

    // Game State
    let isManualMode = false;
    let manualCounter = 1;
    let gridNumbers = [];
    let lastMarkedCell = null;
    let completedLines = 0;
    let gameStarted = false;

    // --- Event Listeners ---
    randomModeBtn.addEventListener('click', () => { playSound(clickSound); setupGrid(false); });
    manualModeBtn.addEventListener('click', () => { playSound(clickSound); setupGrid(true); });
    startGameBtn.addEventListener('click', () => { playSound(clickSound); startGame(); });
    document.getElementById('undo-btn').addEventListener('click', () => { playSound(clickSound); undoLastMark(); });
    restartBtn.addEventListener('click', () => { playSound(clickSound); confirmRestart(); });
    continueBtn.addEventListener('click', () => { playSound(clickSound); continueGame(); });
    exitBtnStart.addEventListener('click', () => { playSound(clickSound); confirmExit(); });
    exitBtnGame.addEventListener('click', () => { playSound(clickSound); confirmExit(); });
    exitBtnEnd.addEventListener('click', () => { playSound(clickSound); confirmExit(); });
    
    // --- Helper Functions ---
    const playSound = (sound) => {
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Sound play failed:", e));
    };
    
    const showNotification = (message) => {
        const existingNotif = document.querySelector('.notification');
        if (existingNotif) existingNotif.remove();
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);
    };

    // --- Core Game Logic ---
    function setupGrid(manual) {
        isManualMode = manual;
        gameStarted = false;
        bingoGrid.innerHTML = '';
        bingoGrid.classList.remove('hidden');
        document.getElementById('game-controls').classList.add('hidden');
        startGameBtn.classList.remove('hidden');
        bingoDisplay.classList.add('hidden');
        winnerDisplay.classList.add('hidden');
        inGameButtons.classList.add('hidden');
        
        gridNumbers = [];
        manualCounter = 1;

        if (!isManualMode) {
            let numbers = Array.from({ length: 25 }, (_, i) => i + 1);
            for (let i = numbers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
            }
            gridNumbers = numbers;
        }

        for (let i = 0; i < 25; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            if (!isManualMode) {
                cell.textContent = gridNumbers[i];
            }
            cell.dataset.index = i;
            cell.addEventListener('click', isManualMode ? fillManualCell : markCell);
            bingoGrid.appendChild(cell);
        }
    }

    function fillManualCell(event) {
        const cell = event.target;
        if (!cell.textContent && manualCounter <= 25) {
            playSound(markSound);
            cell.textContent = manualCounter;
            gridNumbers[parseInt(cell.dataset.index)] = manualCounter;
            manualCounter++;
        }
    }

    function startGame() {
        if (isManualMode && manualCounter <= 25) {
            showNotification('Please fill all cells before starting!');
            return;
        }
        gameStarted = true;
        startGameBtn.classList.add('hidden');
        bingoDisplay.classList.remove('hidden');
        inGameButtons.classList.remove('hidden'); // Show container for Undo and Exit
        showNotification('Game Started! Good luck.');
        
        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            cell.removeEventListener('click', fillManualCell);
            cell.addEventListener('click', markCell);
        });
    }

    function markCell(event) {
        if (!gameStarted) return;
        const cell = event.target;
        if (cell.classList.contains('marked')) {
            showNotification("This number is already marked.");
            return;
        }
        playSound(markSound);
        cell.classList.add('marked');
        lastMarkedCell = cell;
        checkWin();
    }

    function undoLastMark() {
        if (lastMarkedCell) {
            lastMarkedCell.classList.remove('marked');
            lastMarkedCell = null;
            showNotification("Last mark undone.");
            checkWin(); // Re-check win state after undo
        } else {
            showNotification("No move to undo.");
        }
    }

    function checkWin() {
        const cells = Array.from(document.querySelectorAll('.grid-cell'));
        let currentLines = 0;
        
        cells.forEach(cell => cell.classList.remove('winning-line'));

        const winningCombos = [
            [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
            [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
            [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
        ];

        winningCombos.forEach(combo => {
            if (combo.every(index => cells[index].classList.contains('marked'))) {
                currentLines++;
                combo.forEach(index => cells[index].classList.add('winning-line'));
            }
        });

        if (currentLines > completedLines) {
            showNotification(`You completed a line!`);
        }
        completedLines = currentLines;
        updateBingoDisplay(completedLines);

        if (completedLines >= 5) {
            playSound(winSound);
            winnerDisplay.classList.remove('hidden');
            inGameButtons.classList.add('hidden'); // Hide Undo and Exit
            gameStarted = false;
        }
    }

    function updateBingoDisplay(lines) {
        const bingoLetters = bingoDisplay.querySelectorAll('span');
        bingoLetters.forEach((letter, index) => {
            if (index < lines) {
                letter.classList.add('cut');
            } else {
                letter.classList.remove('cut');
            }
        });
    }

    // --- Dialog and Confirmation Functions ---

    function confirmRestart() {
        const dialogOverlay = document.createElement('div');
        dialogOverlay.className = 'dialog-overlay';
        
        dialogOverlay.innerHTML = `
            <div class="dialog-box">
                <p>Are you sure you want to start a new game?</p>
                <div class="dialog-buttons">
                    <button id="confirm-restart">Yes, Restart</button>
                    <button id="cancel-restart" class="cancel">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialogOverlay);
        
        dialogOverlay.querySelector('#confirm-restart').addEventListener('click', () => {
            playSound(clickSound);
            location.reload();
        });
        
        dialogOverlay.querySelector('#cancel-restart').addEventListener('click', () => {
            playSound(clickSound);
            dialogOverlay.remove();
        });
    }

    function confirmExit() {
        const dialogOverlay = document.createElement('div');
        dialogOverlay.className = 'dialog-overlay';

        dialogOverlay.innerHTML = `
            <div class="dialog-box">
                <p>Are you sure you want to exit?</p>
                <div class="dialog-buttons">
                    <button id="confirm-exit" class="exit-btn">Yes, Exit</button>
                    <button id="cancel-exit" class="cancel">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialogOverlay);

        dialogOverlay.querySelector('#confirm-exit').addEventListener('click', () => {
            playSound(clickSound);
            document.body.innerHTML = `<div class="game-container"><h1>Thanks for playing!</h1><p>You can now safely close this tab.</p></div>`;
            window.close();
        });
        
        dialogOverlay.querySelector('#cancel-exit').addEventListener('click', () => {
            playSound(clickSound);
            dialogOverlay.remove();
        });
    }

    function continueGame() {
        winnerDisplay.classList.add('hidden');
        inGameButtons.classList.remove('hidden'); // Show Undo and Exit again
        updateBingoDisplay(0);

        const allCells = document.querySelectorAll('.grid-cell');
        allCells.forEach(cell => {
            cell.classList.remove('marked', 'winning-line');
        });
        
        completedLines = 0;
        lastMarkedCell = null;
        gameStarted = true;
        showNotification("Grid has been reset. Let's play again!");
    }
});
