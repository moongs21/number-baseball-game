// 게임 상태 관리
let gameState = {
    answer: [],
    attempts: 0,
    history: [],
    bestScore: localStorage.getItem('bestScore') || null
};

// 게임 초기화
function initGame() {
    gameState.answer = generateAnswer();
    gameState.attempts = 0;
    gameState.history = [];
    
    document.getElementById('guessInput').value = '';
    document.getElementById('attemptCount').textContent = '0';
    document.getElementById('historyList').innerHTML = '<p class="empty-message">아직 시도한 기록이 없습니다.</p>';
    document.getElementById('errorMsg').textContent = '';
    document.getElementById('resultModal').classList.remove('show');
    
    if (gameState.bestScore) {
        document.getElementById('bestScore').textContent = gameState.bestScore;
    }
    
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
    // 최고 기록 업데이트
    if (!gameState.bestScore || gameState.attempts < parseInt(gameState.bestScore)) {
        gameState.bestScore = gameState.attempts.toString();
        localStorage.setItem('bestScore', gameState.bestScore);
        document.getElementById('bestScore').textContent = gameState.bestScore;
    }
    
    // 모달 표시
    document.getElementById('finalAttempts').textContent = gameState.attempts;
    document.getElementById('resultModal').classList.add('show');
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
    
    // 입력 필드에 포커스
    guessInput.focus();
});

