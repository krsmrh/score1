let players = [];
let scores = {};
let currentRound = 0;
let currentOni;

document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('next-round').addEventListener('click', () => {
    calculateRoundScore(); // 新しく追加
    nextRound();
});
document.getElementById('reset-game').addEventListener('click', resetGame);
document.getElementById('add-point').addEventListener('click', () => adjustScore(1));
document.getElementById('subtract-point').addEventListener('click', () => adjustScore(-1));

function startGame() {
    players = [
        document.getElementById('player1').value,
        document.getElementById('player2').value,
        document.getElementById('player3').value,
        document.getElementById('player4').value,
        document.getElementById('player5').value
    ].filter(name => name.trim() !== '');

    if (players.length !== 5) {
        alert('5人のプレイヤー名を入力してください。');
        return;
    }

    players.forEach(player => {
        scores[player] = 0;
    });

    document.getElementById('game-setup').style.display = 'none';
    document.getElementById('game-play').style.display = 'block';
    document.getElementById('results').style.display = 'block';

    setupPlayerSelect();
    nextRound();
}

function nextRound() {
    if (currentRound >= 5) {
        endGame();
        return;
    }

    currentRound++;
    currentOni = players[currentRound - 1];
    document.getElementById('current-oni').textContent = currentOni;

    const runnerList = document.getElementById('runner-list');
    runnerList.innerHTML = '';
    players.filter(player => player !== currentOni).forEach(player => {
        const li = document.createElement('li');
        li.textContent = player;
        li.draggable = true;
        runnerList.appendChild(li);
    });

    document.getElementById('caught-count').value = 0; // 新しく追加

    setupDragAndDrop();
    setupDefeatOniButtons();
    updateScoreDisplay();
}

function setupDragAndDrop() {
    const runnerList = document.getElementById('runner-list');
    let draggedItem = null;

    runnerList.addEventListener('dragstart', function(e) {
        draggedItem = e.target;
        setTimeout(() => e.target.style.display = 'none', 0);
    });

    runnerList.addEventListener('dragend', function(e) {
        setTimeout(() => e.target.style.display = '', 0);
    });

    runnerList.addEventListener('dragover', function(e) {
        e.preventDefault();
        const afterElement = getDragAfterElement(runnerList, e.clientY);
        const draggable = document.querySelector('.dragging');
        if (afterElement == null) {
            runnerList.appendChild(draggedItem);
        } else {
            runnerList.insertBefore(draggedItem, afterElement);
        }
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function setupDefeatOniButtons() {
    const defeatOniButtons = document.getElementById('defeat-oni-buttons');
    defeatOniButtons.innerHTML = '';
    players.filter(player => player !== currentOni).forEach(player => {
        const button = document.createElement('button');
        button.textContent = `${player} が鬼を倒した`;
        button.addEventListener('click', () => defeatOni(player));
        defeatOniButtons.appendChild(button);
    });
}

function defeatOni(player) {
    scores[player]++;
    scores[currentOni]--;
    updateScoreDisplay();
}

function updateScoreDisplay() {
    const scoreList = document.getElementById('score-list');
    scoreList.innerHTML = '';
    Object.entries(scores).sort((a, b) => b[1] - a[1]).forEach(([player, score]) => {
        const li = document.createElement('li');
        li.textContent = `${player}: ${score}点`;
        scoreList.appendChild(li);
    });
}

function endGame() {
    document.getElementById('game-play').style.display = 'none';
    document.getElementById('results').style.display = 'none';
    document.getElementById('final-results').style.display = 'block';

    const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    document.getElementById('winner').textContent = winner;

    const finalScoreList = document.getElementById('final-score-list');
    finalScoreList.innerHTML = '';
    Object.entries(scores).sort((a, b) => b[1] - a[1]).forEach(([player, score], index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}位: ${player} (${score}点)`;
        finalScoreList.appendChild(li);
    });
}

function resetGame() {
    currentRound = 0;
    scores = {};
    players.forEach(player => {
        scores[player] = 0;
    });
    document.getElementById('final-results').style.display = 'none';
    document.getElementById('game-play').style.display = 'block';
    document.getElementById('results').style.display = 'block';
    nextRound();
}

function setupPlayerSelect() {
    const playerSelect = document.getElementById('player-select');
    playerSelect.innerHTML = '';
    players.forEach(player => {
        const option = document.createElement('option');
        option.value = player;
        option.textContent = player;
        playerSelect.appendChild(option);
    });
}

function adjustScore(amount) {
    const player = document.getElementById('player-select').value;
    scores[player] += amount;
    updateScoreDisplay();
}

function calculateRoundScore() {
    const runnerList = document.getElementById('runner-list');
    const runners = Array.from(runnerList.children).map(li => li.textContent);
    const caughtCount = parseInt(document.getElementById('caught-count').value) || 0;

    // 鬼のスコア計算
    scores[currentOni] += caughtCount;

    // 逃げる側のスコア計算
    const scoreValues = [2, 1, 0, -1];
    runners.forEach((runner, index) => {
        scores[runner] += scoreValues[index];
    });

    updateScoreDisplay();
}

