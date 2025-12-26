// 게임 상태 관리
let gameState = {
    answer: [],
    attempts: 0,
    history: [],
    bestScore: localStorage.getItem('bestScore') || null,
    currentRank: null
};

// 스코어보드 가져오기
function getScoreboard() {
    const scoreboard = localStorage.getItem('scoreboard');
    return scoreboard ? JSON.parse(scoreboard) : [];
}

// 스코어보드 저장
function saveScoreboard(scoreboard) {
    localStorage.setItem('scoreboard', JSON.stringify(scoreboard));
}

// 스코어보드에 기록 추가
function addToScoreboard(score, name = '익명') {
    const scoreboard = getScoreboard();
    const date = new Date().toLocaleDateString('ko-KR');
    
    scoreboard.push({
        name: name || '익명',
        score: score,
        date: date
    });
    
    // 점수 순으로 정렬 (낮은 점수가 좋은 기록)
    scoreboard.sort((a, b) => a.score - b.score);
    
    // 상위 10개만 유지
    if (scoreboard.length > 10) {
        scoreboard.splice(10);
    }
    
    saveScoreboard(scoreboard);
    return scoreboard;
}

// 상위 10위 내 기록인지 확인
function isTop10Record(score) {
    const scoreboard = getScoreboard();
    
    // 기록이 10개 미만이면 무조건 진입
    if (scoreboard.length < 10) {
        return true;
    }
    
    // 10위 기록보다 좋은 점수인지 확인
    const worstScore = scoreboard[scoreboard.length - 1].score;
    return score <= worstScore;
}

// 순위 확인
function getRank(score) {
    const scoreboard = getScoreboard();
    
    // 현재 점수보다 좋은 기록의 개수
    let rank = 1;
    for (let i = 0; i < scoreboard.length; i++) {
        if (scoreboard[i].score < score) {
            rank++;
        } else {
            break;
        }
    }
    
    return rank;
}

// 스코어보드 표시
function displayScoreboard() {
    const scoreboard = getScoreboard();
    const scoreboardList = document.getElementById('scoreboardList');
    
    if (scoreboard.length === 0) {
        scoreboardList.innerHTML = '<p class="empty-message">아직 기록이 없습니다.</p>';
        return;
    }
    
    scoreboardList.innerHTML = '';
    
    scoreboard.forEach((record, index) => {
        const rank = index + 1;
        const item = document.createElement('div');
        item.className = 'scoreboard-item';
        
        // 새로 추가된 기록인지 확인 (최근 1초 이내)
        if (gameState.currentRank === rank) {
            item.classList.add('new-record');
        }
        
        const rankSpan = document.createElement('span');
        rankSpan.className = 'scoreboard-rank' + (rank <= 3 ? ' top3' : '');
        rankSpan.textContent = rank;
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'scoreboard-info';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'scoreboard-name' + (record.name === '익명' ? ' anonymous' : '');
        nameSpan.textContent = record.name;
        
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'scoreboard-details';
        detailsDiv.innerHTML = `<span>${record.date}</span>`;
        
        infoDiv.appendChild(nameSpan);
        infoDiv.appendChild(detailsDiv);
        
        const scoreSpan = document.createElement('span');
        scoreSpan.className = 'scoreboard-score';
        scoreSpan.textContent = `${record.score}회`;
        
        item.appendChild(rankSpan);
        item.appendChild(infoDiv);
        item.appendChild(scoreSpan);
        
        scoreboardList.appendChild(item);
    });
}

// 게임 초기화
function initGame() {
    gameState.answer = generateAnswer();
    gameState.attempts = 0;
    gameState.history = [];
    gameState.currentRank = null;
    
    document.getElementById('guessInput').value = '';
    document.getElementById('attemptCount').textContent = '0';
    document.getElementById('historyList').innerHTML = '<p class="empty-message">아직 시도한 기록이 없습니다.</p>';
    document.getElementById('errorMsg').textContent = '';
    document.getElementById('resultModal').classList.remove('show');
    document.getElementById('nameInputModal').classList.remove('show');
    
    if (gameState.bestScore) {
        document.getElementById('bestScore').textContent = gameState.bestScore;
    }
    
    displayScoreboard();
    
    console.log('정답:', gameState.answer.join('')); // 디버깅용 (실제 게임에서는 제거)
}

// 4자리 중복 없는 숫자 생성
function generateAnswer() {
    const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const answer = [];
    
    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        answer.push(digits.splice(randomIndex, 1)[0]);
    }
    
    return answer;
}

// 입력 검증
function validateInput(input) {
    const errorMsg = document.getElementById('errorMsg');
    
    // 빈 입력 체크
    if (!input || input.trim() === '') {
        errorMsg.textContent = '숫자를 입력해주세요.';
        return false;
    }
    
    // 숫자만 입력되었는지 체크
    if (!/^\d+$/.test(input)) {
        errorMsg.textContent = '숫자만 입력할 수 있습니다.';
        return false;
    }
    
    // 4자리 체크
    if (input.length !== 4) {
        errorMsg.textContent = '4자리 숫자를 입력해주세요.';
        return false;
    }
    
    // 중복 체크
    const digits = input.split('');
    const uniqueDigits = new Set(digits);
    if (uniqueDigits.size !== 4) {
        errorMsg.textContent = '서로 다른 4자리 숫자를 입력해주세요.';
        return false;
    }
    
    errorMsg.textContent = '';
    return true;
}

// 스트라이크/볼 판정
function checkGuess(guess) {
    const guessDigits = guess.split('').map(Number);
    let strikes = 0;
    let balls = 0;
    
    for (let i = 0; i < 4; i++) {
        if (guessDigits[i] === gameState.answer[i]) {
            strikes++;
        } else if (gameState.answer.includes(guessDigits[i])) {
            balls++;
        }
    }
    
    return { strikes, balls };
}

// 히스토리 추가
function addToHistory(guess, result) {
    gameState.history.push({ guess, ...result });
    gameState.attempts++;
    
    const historyList = document.getElementById('historyList');
    
    // 빈 메시지 제거
    if (historyList.querySelector('.empty-message')) {
        historyList.innerHTML = '';
    }
    
    // 히스토리 아이템 생성
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    
    const numberSpan = document.createElement('span');
    numberSpan.className = 'history-number';
    numberSpan.textContent = guess;
    
    const resultDiv = document.createElement('div');
    resultDiv.className = 'history-result';
    
    if (result.strikes > 0) {
        const strikeBadge = document.createElement('span');
        strikeBadge.className = 'result-badge strike-badge';
        strikeBadge.textContent = `${result.strikes}S`;
        resultDiv.appendChild(strikeBadge);
    }
    
    if (result.balls > 0) {
        const ballBadge = document.createElement('span');
        ballBadge.className = 'result-badge ball-badge';
        ballBadge.textContent = `${result.balls}B`;
        resultDiv.appendChild(ballBadge);
    }
    
    if (result.strikes === 0 && result.balls === 0) {
        const outBadge = document.createElement('span');
        outBadge.className = 'result-badge out-badge';
        outBadge.textContent = 'OUT';
        resultDiv.appendChild(outBadge);
    }
    
    historyItem.appendChild(numberSpan);
    historyItem.appendChild(resultDiv);
    
    // 최신 기록을 맨 위에 추가
    historyList.insertBefore(historyItem, historyList.firstChild);
    
    // 시도 횟수 업데이트
    document.getElementById('attemptCount').textContent = gameState.attempts;
}

// 게임 종료 처리
function endGame() {
    const attempts = gameState.attempts;
    
    // 최고 기록 업데이트
    if (!gameState.bestScore || attempts < parseInt(gameState.bestScore)) {
        gameState.bestScore = attempts.toString();
        localStorage.setItem('bestScore', gameState.bestScore);
        document.getElementById('bestScore').textContent = gameState.bestScore;
    }
    
    // 상위 10위 내 기록인지 확인
    if (isTop10Record(attempts)) {
        gameState.currentRank = getRank(attempts);
        
        // 이름 입력 모달 표시
        document.getElementById('rankNumber').textContent = gameState.currentRank;
        document.getElementById('playerNameInput').value = '';
        document.getElementById('nameErrorMsg').textContent = '';
        document.getElementById('nameInputModal').classList.add('show');
        document.getElementById('playerNameInput').focus();
    } else {
        // 일반 결과 모달 표시
        showResultModal(attempts, null);
    }
}

// 결과 모달 표시
function showResultModal(attempts, rank) {
    document.getElementById('finalAttempts').textContent = attempts;
    
    const rankInfo = document.getElementById('rankInfo');
    if (rank) {
        rankInfo.innerHTML = `🎯 <strong>${rank}위</strong>에 등록되었습니다!`;
        rankInfo.style.display = 'block';
    } else {
        rankInfo.style.display = 'none';
    }
    
    document.getElementById('resultModal').classList.add('show');
}

// 이름 저장 처리
function savePlayerName() {
    const nameInput = document.getElementById('playerNameInput');
    const name = nameInput.value.trim();
    const errorMsg = document.getElementById('nameErrorMsg');
    
    // 이름 검증
    if (name.length > 10) {
        errorMsg.textContent = '이름은 최대 10자까지 입력할 수 있습니다.';
        return;
    }
    
    // 스코어보드에 추가
    const playerName = name || '익명';
    addToScoreboard(gameState.attempts, playerName);
    
    // 스코어보드 업데이트
    displayScoreboard();
    
    // 이름 입력 모달 닫기
    document.getElementById('nameInputModal').classList.remove('show');
    
    // 결과 모달 표시
    showResultModal(gameState.attempts, gameState.currentRank);
    
    // 새 기록 하이라이트 제거 (3초 후)
    setTimeout(() => {
        gameState.currentRank = null;
        displayScoreboard();
    }, 3000);
}

// 게임 진행
function processGuess() {
    const input = document.getElementById('guessInput');
    const guess = input.value.trim();
    
    if (!validateInput(guess)) {
        return;
    }
    
    // 이미 시도한 숫자인지 체크
    if (gameState.history.some(h => h.guess === guess)) {
        document.getElementById('errorMsg').textContent = '이미 시도한 숫자입니다.';
        return;
    }
    
    const result = checkGuess(guess);
    addToHistory(guess, result);
    
    input.value = '';
    input.focus();
    
    // 정답인 경우
    if (result.strikes === 4) {
        endGame();
    }
}

// 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', () => {
    // 게임 초기화
    initGame();
    
    // 입력 필드 이벤트
    const guessInput = document.getElementById('guessInput');
    guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            processGuess();
        }
    });
    
    // 숫자만 입력 허용
    guessInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
    
    // 확인 버튼
    document.getElementById('submitBtn').addEventListener('click', processGuess);
    
    // 새 게임 버튼
    document.getElementById('resetBtn').addEventListener('click', initGame);
    
    // 모달 새 게임 버튼
    document.getElementById('newGameBtn').addEventListener('click', () => {
        document.getElementById('resultModal').classList.remove('show');
        initGame();
    });
    
    // 모달 외부 클릭 시 닫기
    document.getElementById('resultModal').addEventListener('click', (e) => {
        if (e.target.id === 'resultModal') {
            document.getElementById('resultModal').classList.remove('show');
            initGame();
        }
    });
    
    // 이름 입력 모달 이벤트
    const playerNameInput = document.getElementById('playerNameInput');
    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            savePlayerName();
        }
    });
    
    // 이름 저장 버튼
    document.getElementById('saveScoreBtn').addEventListener('click', savePlayerName);
    
    // 이름 건너뛰기 버튼
    document.getElementById('skipNameBtn').addEventListener('click', () => {
        addToScoreboard(gameState.attempts, '익명');
        displayScoreboard();
        document.getElementById('nameInputModal').classList.remove('show');
        showResultModal(gameState.attempts, gameState.currentRank);
        
        setTimeout(() => {
            gameState.currentRank = null;
            displayScoreboard();
        }, 3000);
    });
    
    // 이름 입력 모달 외부 클릭 시 닫기 (건너뛰기로 처리)
    document.getElementById('nameInputModal').addEventListener('click', (e) => {
        if (e.target.id === 'nameInputModal') {
            document.getElementById('skipNameBtn').click();
        }
    });
    
    // 초기 스코어보드 표시
    displayScoreboard();
    
    // 입력 필드에 포커스
    guessInput.focus();
});

