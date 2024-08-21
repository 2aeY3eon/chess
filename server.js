const mysql = require('mysql2');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const session = require('express-session');
const RedisStore = require('connect-redis').default; // .default를 사용하여 RedisStore 클래스를 가져옴
const { createClient } = require('redis');

const redisClient = createClient({
    host: '127.0.0.1',
    port: 6379
});

redisClient.connect().catch(console.error);

app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: 'super_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // HTTPS를 사용할 때 true로 설정
}));

////////////////////
////// board ///////
////////////////////

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

let RealCurrentTurn = 'white';

////////////////////
////// mysql ///////
////////////////////

// mysql 연결 설정
const connection = mysql.createConnection({ 
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'chess'
});

// mysql 연결
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database');
});

// 쿼리 실행
/*
connection.query('SELECT * FROM users', (err, results) => {
    if (err) {
        console.error('Error executing query:', err);
        return;
    }
    console.log('Query results:', results);
});*/
///////////////////////
// web socket /////////
///////////////////////


userCnt = 0;
let moveTimer = null;
const moveTimeLimit = 30000;

username = '';
users = {
    'white':'??',
    'black':'??'
}

app.use(express.static('public'));

app.get('/board', (req, res) => {
    res.sendFile(__dirname + '/board.html');

    username = req.query['n'];
    console.log(username);
});


io.on('connection', (socket) => { // socket.io 연결되었을 때
    console.log('a user connected');
    userCnt++;

    if(userCnt == 2) { // 유저 2명일 때
        console.log('game start');
        users.black = username;
        io.emit('userVs', users);
        socket.emit('second-player', 'black'); // 2팀
        io.emit('gameStart');
        startMoveTimer();
    } else if(userCnt==1) {
        console.log('readying');
        users.white = username;
        io.emit('userVs', users);
        socket.emit('first-player', 'white'); // 1팀
        io.emit('ready');
        stopMoveTimer();
    }

    socket.on('changeTurn', (getBoard) => {
        if(RealCurrentTurn == 'white') {
            RealCurrentTurn = 'black';
        } else {
            RealCurrentTurn = 'white';
        }
        initialBoard = getBoard;
        io.emit('changeTurn', RealCurrentTurn);
        io.emit('changeBoard', initialBoard);
        
        startMoveTimer();
    });

    function startMoveTimer() {
        stopMoveTimer(); 
        remainingTime = moveTimeLimit / 1000;
        updateTimerDisplay();
        moveTimer = setInterval(() => {
            remainingTime--;
            updateTimerDisplay();
            if (remainingTime <= 0) {
                clearInterval(moveTimer);
                io.emit('timeout', RealCurrentTurn);
            }
        }, 1000);
    }
    
    function stopMoveTimer() {
        if (moveTimer !== null) {
            clearInterval(moveTimer);
            moveTimer = null;
        }
    }
    
    function updateTimerDisplay() {
        io.emit('updateTimer', remainingTime);
    }

    socket.on('giveUp', (myTurn) => { //항복시, 항복 팀 입력받음
        socket.broadcast.emit('giveUp', myTurn);
        // DB에도 입력하기
    });

    socket.on('drawPlz', function() {
        socket.broadcast.emit('drawPlz');
    });

    socket.on('drawYeah', function() {
        socket.broadcast.emit('drawYeah');
    });
    socket.on('drawNope', function() {
        socket.broadcast.emit('drawNope');
    })

    socket.on('disconnect', () => { // 연결 끊어졌을 시
        console.log('user disconnected');
        userCnt--;

        users = {
            'white':'??',
            'black':'??'
        }

        socket.broadcast.emit('user-disconn');
    });

    socket.on('gameWin', function(player_turn) {
    });
    
    socket.on('gameLose', function(player_turn) {
    
    });
});

server.listen(8000, () => {
    console.log('listening on *:8000');
});