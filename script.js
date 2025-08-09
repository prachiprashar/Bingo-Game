document.addEventListener('DOMContentLoaded', () => {
    const randomModeBtn = document.getElementById('random-mode-btn');
    const manualModeBtn = document.getElementById('manual-mode-btn');
    const bingoGrid = document.getElementById('bingo-grid');
    const startGameBtn = document.getElementById('start-game-btn');
    const bingoDisplay = document.getElementById('bingo-display');
    const undoBtn = document.getElementById('undo-btn');
    const winnerDisplay = document.getElementById('winner-display');
    const restartBtn = document.getElementById('restart-btn');
    const continueBtn = document.getElementById('continue-btn');

    let isManualMode = false;
    let manualCounter = 1;
    let gridNumbers = [];
    let lastMarkedCell = null;
    let completedLines = 0;

    randomModeBtn.addEventListener('click', () => setupGrid(false));
    manualModeBtn.addEventListener('click', () => setupGrid(true));
    startGameBtn.addEventListener('click', startGame);
    undoBtn.addEventListener('click', undoLastMark);
    restartBtn.addEventListener('click', () => location.reload());
    continueBtn.addEventListener('click', continueGame);

    function setupGrid(manual) {
        isManualMode = manual;
        bingoGrid.innerHTML = '';
        bingoGrid.classList.remove('hidden');
        randomModeBtn.classList.add('hidden');
        manualModeBtn.classList.add('hidden');
        startGameBtn.classList.remove('hidden');
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
            if (isManualMode) {
                cell.addEventListener('click', fillManualCell);
            }
            bingoGrid.appendChild(cell);
        }
    }

    function fillManualCell(event) {
        const cell = event.target;
        if (!cell.textContent && manualCounter <= 25) {
            cell.textContent = manualCounter;
            gridNumbers[parseInt(cell.dataset.index)] = manualCounter;
            manualCounter++;
        }
    }

    function startGame() {
        if (isManualMode && manualCounter <= 25) {
            alert('Please fill all the cells before starting the game.');
            return;
        }
        startGameBtn.classList.add('hidden');
        bingoDisplay.classList.remove('hidden');
        undoBtn.classList.remove('hidden');
        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            cell.removeEventListener('click', fillManualCell);
            cell.addEventListener('click', markCell);
        });
    }

    function markCell(event) {
        const cell = event.target;
        if (!cell.classList.contains('marked')) {
            cell.classList.add('marked');
            lastMarkedCell = cell;
            checkWin();
        }
    }

    function undoLastMark() {
        if (lastMarkedCell) {
            lastMarkedCell.classList.remove('marked');
            lastMarkedCell = null;
        }
    }

    function checkWin() {
        const cells = Array.from(document.querySelectorAll('.grid-cell'));
        let lines = 0;

        // Check rows
        for (let i = 0; i < 5; i++) {
            const row = cells.slice(i * 5, i * 5 + 5);
            if (row.every(cell => cell.classList.contains('marked'))) {
                lines++;
                row.forEach(cell => cell.classList.add('winning-line'));
            }
        }

        // Check columns
        for (let i = 0; i < 5; i++) {
            const col = [cells[i], cells[i + 5], cells[i + 10], cells[i + 15], cells[i + 20]];
            if (col.every(cell => cell.classList.contains('marked'))) {
                lines++;
                col.forEach(cell => cell.classList.add('winning-line'));
            }
        }

        // Check diagonals
        const diag1 = [cells[0], cells[6], cells[12], cells[18], cells[24]];
        if (diag1.every(cell => cell.classList.contains('marked'))) {
            lines++;
            diag1.forEach(cell => cell.classList.add('winning-line'));
        }

        const diag2 = [cells[4], cells[8], cells[12], cells[16], cells[20]];
        if (diag2.every(cell => cell.classList.contains('marked'))) {
            lines++;
            diag2.forEach(cell => cell.classList.add('winning-line'));
        }

        updateBingoDisplay(lines);

        if (lines >= 5) {
            winnerDisplay.classList.remove('hidden');
            undoBtn.classList.add('hidden');
             const allCells = document.querySelectorAll('.grid-cell');
            allCells.forEach(cell => {
                cell.removeEventListener('click', markCell);
            });
        }
    }

    function updateBingoDisplay(lines) {
        completedLines = lines;
        const bingoLetters = bingoDisplay.querySelectorAll('span');
        bingoLetters.forEach((letter, index) => {
            if (index < completedLines) {
                letter.classList.add('cut');
            } else {
                letter.classList.remove('cut');
            }
        });
    }

    // NEW - USE THIS INSTEAD
    // THIS IS THE NEW, CORRECTED CODE
    function continueGame() {
        // Hide the winner pop-up
        winnerDisplay.classList.add('hidden');
        undoBtn.classList.remove('hidden');

        // Reset the BINGO display
        const bingoLetters = bingoDisplay.querySelectorAll('span');
        bingoLetters.forEach(letter => {
            letter.classList.remove('cut');
        });

        // Clear all marks from the grid
        const allCells = document.querySelectorAll('.grid-cell');
        allCells.forEach(cell => {
            cell.classList.remove('marked');
            cell.classList.remove('winning-line');
            // Make sure cells can be clicked again
            cell.addEventListener('click', markCell);
        });

        // Reset the game's internal state
        completedLines = 0;
        lastMarkedCell = null;
    }
});