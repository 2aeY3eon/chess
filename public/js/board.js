const chessboard = document.getElementById("chessboard");

var initialBoard = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

const pieceImages = {
    'r': 'images/black_rook.png',
    'n': 'images/black_knight.png',
    'b': 'images/black_bishop.png',
    'q': 'images/black_queen.png',
    'k': 'images/booil.png',
    'p': 'images/black_pawn.png',
    'R': 'images/white_rook.png',
    'N': 'images/white_knight.png',
    'B': 'images/white_bishop.png',
    'Q': 'images/white_queen.png',
    'K': 'images/sjy.png',
    'P': 'images/white_pawn.png'
};

let myTurn = '';
game_status = 'off';
let kingMoved = { white: false, black: false };
let rookMoved = { 'white-left': false, 'white-right': false, 'black-left': false, 'black-right': false };
let lastPawnMove = { row: null, col: null }; // 앙파상을 위해 마지막 폰 이동 기록

function createBoard() {
    for (let i = 0; i < 8; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        chessboard.appendChild(row);

        for (let j = 0; j < 8; j++) {
            const square = document.createElement('div');
            square.className = 'square ' + ((i + j) % 2 === 0 ? 'white' : 'green');
            square.dataset.row = i;
            square.dataset.col = j;
            row.appendChild(square);

            const piece = initialBoard[i][j];
            if (piece !== '.') {
                const img = document.createElement('img');
                img.src = pieceImages[piece];
                img.className = 'piece';
                img.draggable = true;
                img.addEventListener('dragstart', onDragStart);
                square.appendChild(img);
            }

            square.addEventListener('dragover', onDragOver);
            square.addEventListener('drop', onDrop);
        }
    }
}

function onDragStart(event) {
    const piece = event.target;
    const row = piece.parentElement.dataset.row;
    const col = piece.parentElement.dataset.col;
    const pieceChar = initialBoard[row][col];
    const data = JSON.stringify({ piece: pieceChar, fromRow: row, fromCol: col });

    console.log("Setting drag data:", data);

    event.dataTransfer.setData("text/plain", data);
}

function onDragOver(event) {
    event.preventDefault();
}

let currentTurn = 'white';

let moveTimer = null;
const moveTimeLimit = 30000; // 30초
let remainingTime = moveTimeLimit / 1000; // 초기 시간 (초 단위)

function onDrop(event) {
    event.preventDefault();

    let data;
    try {
        data = JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch (e) {
        console.error("Drag and drop data is invalid or missing:", e);
        return;
    }

    const fromRow = parseInt(data.fromRow);
    const fromCol = parseInt(data.fromCol);
    const pieceChar = data.piece;

    if ((currentTurn === 'white' && pieceChar !== pieceChar.toUpperCase()) ||
        (currentTurn === 'black' && pieceChar !== pieceChar.toLowerCase())) {
        alert("상대 차례입니다.");
        return;
    }
    if(myTurn != currentTurn) {
        alert('자신의 차례가 아닙니다');
        alert(myTurn + currentTurn);
        return
    }
    if(game_status != 'on') {
        alert('아직 게임이 시작되지 않았습니다');
        return;
    }

    let toRow = parseInt(event.target.dataset.row);
    let toCol = parseInt(event.target.dataset.col);

    if (event.target.tagName === 'IMG') {
        toRow = parseInt(event.target.parentElement.dataset.row);
        toCol = parseInt(event.target.parentElement.dataset.col);
    }

    if (isValidMove(pieceChar, fromRow, fromCol, toRow, toCol)) {
        const tempBoard = initialBoard.map(row => row.slice());

        initialBoard[toRow][toCol] = pieceChar;
        initialBoard[fromRow][fromCol] = '.';

        const movingPieceElement = document.querySelector(`[data-row='${fromRow}'][data-col='${fromCol}'] .piece`);
        const targetSquare = document.querySelector(`[data-row='${toRow}'][data-col='${toCol}']`);

        if (targetSquare.firstChild) {
            targetSquare.removeChild(targetSquare.firstChild);
        }

        targetSquare.appendChild(movingPieceElement);

        if (pieceChar.toLowerCase() === 'p' && (toRow === 0 || toRow === 7)) {
            handlePromotion(toRow, toCol, pieceChar);
        }

        handleCastling(pieceChar, fromRow, fromCol, toRow, toCol);

        if (pieceChar.toLowerCase() === 'p') {
            lastPawnMove = { row: toRow, col: toCol };
        } else {
            lastPawnMove = { row: null, col: null };
        }

        currentTurn = currentTurn === 'white' ? 'black' : 'white';
        socket.emit('changeTurn', initialBoard);

        if (isInCheck(currentTurn)) {
            alert(currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1) + " 체크 상태입니다!");
        }
    }
}

// function startMoveTimer() {
//     stopMoveTimer(); 
//     remainingTime = moveTimeLimit / 1000;
//     updateTimerDisplay();
//     moveTimer = setInterval(() => {
//         remainingTime--;
//         updateTimerDisplay();
//         if (remainingTime <= 0) {
//             clearInterval(moveTimer);
//             alert(currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1) + " 패배 (시간 초과)!");
//         }
//     }, 1000);
// }

// function stopMoveTimer() {
//     if (moveTimer !== null) {
//         clearInterval(moveTimer);
//         moveTimer = null;
//     }
// }

// function updateTimerDisplay() {
//     const timerElement = document.getElementById("timer");

//     socket.emit('updateTimer', remainingTime);
//     socket.on('updateTimeer', (remTime) {
//         timerElement.textContent = remTime;
//     });

//     timerElement.textContent = remainingTime;
// }

// 폰 프로모션을 처리하는 함수
function handlePromotion(row, col, pieceChar) {
    const promotionOptions = ['q', 'r', 'b', 'n'];
    const promotionChoice = prompt("Promote to (Q)ueen, (R)ook, (B)ishop, or K(N)ight?", "q").toLowerCase();

    if (promotionOptions.includes(promotionChoice)) {
        initialBoard[row][col] = pieceChar === 'P' ? promotionChoice.toUpperCase() : promotionChoice;
        const promotedPiece = pieceImages[initialBoard[row][col]];
        const img = document.querySelector(`[data-row='${row}'][data-col='${col}'] .piece`);
        img.src = promotedPiece;
    } else {
        alert("Invalid choice! Defaulting to Queen.");
        initialBoard[row][col] = pieceChar === 'P' ? 'Q' : 'q';
        const img = document.querySelector(`[data-row='${row}'][data-col='${col}'] .piece`);
        img.src = pieceImages[initialBoard[row][col]];
    }
}


function isInCheck(turn) {
    const kingPosition = findKing(turn);
    const enemyPieces = turn === 'white' ? ['r', 'n', 'b', 'q', 'p'] : ['R', 'N', 'B', 'Q', 'P'];

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = initialBoard[i][j];
            if (enemyPieces.includes(piece)) {
                if (isValidMove(piece, i, j, kingPosition.row, kingPosition.col)) {
                    if (piece.toLowerCase() === 'n' || isPathClear(i, j, kingPosition.row, kingPosition.col)) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function canBlockOrCaptureCheck(turn) {
    const kingPosition = findKing(turn);
    const enemyPieces = turn === 'white' ? ['r', 'n', 'b', 'q', 'p'] : ['R', 'N', 'B', 'Q', 'P'];

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = initialBoard[i][j];
            if ((turn === 'white' && piece === piece.toUpperCase()) ||
                (turn === 'black' && piece === piece.toLowerCase())) {
                for (let k = 0; k < 8; k++) {
                    for (let l = 0; l < 8; l++) {
                        if (isValidMove(piece, i, j, k, l)) {
                            // 임시로 기물 이동 후 체크 여부 확인
                            const tempBoard = initialBoard.map(row => row.slice());
                            initialBoard[k][l] = piece;
                            initialBoard[i][j] = '.';
                            const checkResolved = !isInCheck(turn);
                            initialBoard = tempBoard; // 보드 상태 복구
                            if (checkResolved) {
                                return true; // 기물이 체크를 막을 수 있음
                            }
                        }
                    }
                }
            }
        }
    }
    return false;
}

function findKing(turn) {
    const kingChar = turn === 'white' ? 'K' : 'k';
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (initialBoard[i][j] === kingChar) {
                return { row: i, col: j };
            }
        }
    }
    throw new Error("King not found on the board!");
}

function handleCastling(pieceChar, fromRow, fromCol, toRow, toCol) {
    if (pieceChar.toLowerCase() === 'k') {
        if (pieceChar === 'K') {
            kingMoved.white = true;
            if (fromCol === 4 && toCol === 6) { // 킹사이드 캐슬링
                initialBoard[7][7] = '.';
                initialBoard[7][5] = 'R';
                moveRook(7, 7, 7, 5);
                rookMoved['white-right'] = true;
            } else if (fromCol === 4 && toCol === 2) { // 퀸사이드 캐슬링
                initialBoard[7][0] = '.';
                initialBoard[7][3] = 'R';
                moveRook(7, 0, 7, 3);
                rookMoved['white-left'] = true;
            }
        } else if (pieceChar === 'k') {
            kingMoved.black = true;
            if (fromCol === 4 && toCol === 6) { // 킹사이드 캐슬링
                initialBoard[0][7] = '.';
                initialBoard[0][5] = 'r';
                moveRook(0, 7, 0, 5);
                rookMoved['black-right'] = true;
            } else if (fromCol === 4 && toCol === 2) { // 퀸사이드 캐슬링
                initialBoard[0][0] = '.';
                initialBoard[0][3] = 'r';
                moveRook(0, 0, 0, 3);
                rookMoved['black-left'] = true;
            }
        }
    }
}

function moveRook(fromRow, fromCol, toRow, toCol) {
    const rookElement = document.querySelector(`[data-row='${fromRow}'][data-col='${fromCol}'] .piece`);
    const targetSquare = document.querySelector(`[data-row='${toRow}'][data-col='${toCol}']`);
    if (targetSquare.firstChild) {
        targetSquare.removeChild(targetSquare.firstChild);
    }
    targetSquare.appendChild(rookElement);
}

function isValidMove(piece, fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    const destinationPiece = initialBoard[toRow][toCol];
    if (destinationPiece !== '.') {
        const isSameColor = (piece === piece.toUpperCase() && destinationPiece === destinationPiece.toUpperCase()) ||
            (piece === piece.toLowerCase() && destinationPiece === destinationPiece.toLowerCase());
        if (isSameColor) {
            return false;
        }
    }

    if (piece.toLowerCase() === 'p') {
        const direction = piece === 'P' ? -1 : 1;

        if (fromCol === toCol && rowDiff === 1 && colDiff === 0) {
            return true;
        }
        if ((piece === 'P' && fromRow === 6) || (piece === 'p' && fromRow === 1)) {
            if (rowDiff === 2 && colDiff === 0) {
                return true;
            }
        }
        if (rowDiff === 1 && colDiff === 1) {
            if (toRow === lastPawnMove.row + direction && toCol === lastPawnMove.col) {
                return true; // 앙파상
            }
            return true;
        }
    }

    if (piece.toLowerCase() === 'n') {
        if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
            return true;
        }
    }

    if (piece.toLowerCase() === 'b') {
        if (rowDiff === colDiff) {
            return true;
        }
    }

    if (piece.toLowerCase() === 'r') {
        if (rowDiff === 0 || colDiff === 0) {
            return true;
        }
    }

    if (piece.toLowerCase() === 'q') {
        if (rowDiff === colDiff || rowDiff === 0 || colDiff === 0) {
            return true;
        }
    }

    if (piece.toLowerCase() === 'k') {
        if (rowDiff <= 1 && colDiff <= 1) {
            return true;
        }
        // 캐슬링 체크
        if (!kingMoved[currentTurn] && rowDiff === 0 && colDiff === 2) {
            if (toCol === 6 && !rookMoved[currentTurn + '-right'] && isPathClear(fromRow, fromCol, toRow, 7)) {
                return true; // 킹사이드 캐슬링
            } else if (toCol === 2 && !rookMoved[currentTurn + '-left'] && isPathClear(fromRow, fromCol, toRow, 0)) {
                return true; // 퀸사이드 캐슬링
            }
        }
    }

    return false;
}

function isPathClear(fromRow, fromCol, toRow, toCol) {
    const rowDirection = Math.sign(toRow - fromRow);
    const colDirection = Math.sign(toCol - fromCol);

    let row = fromRow + rowDirection;
    let col = fromCol + colDirection;

    while (row !== toRow || col !== toCol) {
        if (initialBoard[row][col] !== '.') {
            return false;
        }
        row += rowDirection;
        col += colDirection;
    }
    return true;
}

createBoard();

////////////////////////////////////


const newPort = '80';
const linkElement = document.querySelector('#head_img'); // #head_image 선택
const currentHref = 'index.php'; // 현재 href 속성 값 가져오기

// 현재 URL의 포트를 변경
const currentUrl = new URL(currentHref, window.location.href); // 현재 href를 절대 URL로 변환
currentUrl.port = newPort; // 새로운 포트 번호 설정

// 변경된 URL을 href 속성에 설정
linkElement.setAttribute('href', currentUrl.href);

// 문서가 로드된 후 포트 번호 변경


const socket = io();

function giveUp() {
    if(game_status != 'on') {
        alert('아직 게임이 시작되지 않았습니다');
        return;
    }
    socket.emit('giveUp', myTurn);
    giveUpMessage(myTurn);
}

function giveUpMessage(getMyTurn) {
    alert(getMyTurn + ' Team just give up..');
    if (getMyTurn == 'white') {
        alert('black Team WIN');
    }
    else if (getMyTurn == 'black') {
        alert('white Team WIN');
    }
    game_status = 'off';
    location.href=currentUrl.href;
}

socket.on('gameStart', function () {
    console.log('game start');
    game_status = 'on';
    setInterval(() => {
        gameTime++; // 게임 시간 증가
        document.getElementById('game-time').textContent = gameTime; // 화면에 업데이트
    }, 1000); // 1000ms = 1초
});

socket.on('ready', function () {
    console.log('still ready');
});

socket.on('first-player', (getmyturn) => {
    myTurn = getmyturn;
    document.getElementById('my_color').innerHTML = '백';
});
socket.on('second-player', (getmyturn) => {
    myTurn = getmyturn;
    document.getElementById('my_color').innerHTML = '흑'
});
socket.on('ready', function () {
    console.log('still ready');
});

socket.on('updateTimer', (remTime) => {
    const timerElement = document.getElementById("timer");
    timerElement.textContent = remTime;
});

socket.on('changeTurn', (getTurn) => {
    console.log('change Turn');
    currentTurn = getTurn;
    document.getElementById('whosturn').innerHTML = getTurn + ' turn';
    
});

socket.on('changeBoard', (getBoard) => {
    initialBoard = getBoard;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            temp_square = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
            piece = temp_square.querySelector('.piece');
            if (piece) {
                piece.remove();
            }
        }
    }

    for(let i=0; i<8; i++) {
        for(let j=0; j<8; j++) {
            temp_square = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
            const piece = getBoard[i][j];
            if (piece !== '.') {
                const img = document.createElement('img');
                img.src = pieceImages[piece];
                img.className = 'piece';
                img.draggable = true;
                img.addEventListener('dragstart', onDragStart);
                temp_square.appendChild(img);
            }
        }
    }
});

socket.on('giveUp', (getTurn) => {
    giveUpMessage(getTurn);
});


function drawPlz(getTurn) {
    if(game_status != 'on') {
        alert('아직 게임이 시작되지 않았습니다');
        return;
    }
    alert('무승부 요청을 보냈습니다');

    socket.emit('drawPlz');
}

function draw() {
    alert('무승부 되었습니다!');
    game_status = 'off';
    location.href = currentUrl.href;
}

socket.on('drawPlz', function () {
    drawChoice = confirm('무승부 요청을 받겠습니까?');

    if (drawChoice) {
        socket.emit('drawYeah');
        draw();
    }
    else {
        socket.emit('drawNope');
    }
});

socket.on('drawYeah', function () {
    draw();
});
socket.on('drawNope', function () {
    alert('무승부 요청이 거절되었습니다.');
});

function updateChessBoard(moveData) {
    // moveData를 기반으로 체스판을 새로고침
    console.log(moveData.piece + ' moved from ' + moveData.from + ' to ' + moveData.to);
}

socket.on('timeout', function(getCurrentTurn) {
    opTurn = getCurrentTurn === 'white' ? 'black' : 'white';
    game_status = 'off';

    alert('시간초과! ' + opTurn + ' 승!');

    game_win(opTurn);
    game_lose(getCurrentTurn);
    location.href=currentUrl.href;

});

socket.on('user-disconn', function () {
    if(game_status == 'on') {
        alert('플레이어가 나갔습니다\n자동 승리 처리됩니다.');

        opTurn = myTurn === 'white' ? 'black' : 'white';
    
        game_win(myTurn);
        game_lose(opTurn);
        location.href=currentUrl.href;
    }
});

function game_win(player_turn) {
    socket.emit("gameWin", player_turn);
}

function game_lose(player_turn) {
    socket.emit("gameLose", player_turn);
}

socket.on('userVs', function(users) {
    document.getElementById('vs').innerHTML = `${users.white} vs ${users.black}`
});



