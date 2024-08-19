<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chess Game</title>
    <link rel="stylesheet" href="css/board.css">
</head>

<body>
    <?php
        include("header.php");
    ?>

    <div class="all-content">
        <div class="container">
            <div class="header">
                <div>
                    <h3>흑</h3>
                    <h3>0/0/0</h3>
                </div>
                <div>
                    <h1>booil vs jaeyeon</h1>
                </div>
                <div>
                    <h3>게임 시간</h3>
                </div>
            </div>
            <div class="main-content">
                <div id="chessboard" class="chessboard">

                </div>
                <div id="timer-container">
                    <span id="timer">30</span>
                </div>
                <div class="game-controls">
                    <h3>booil turn</h3>
                    <button>기권</button>
                    <button>무승부 신청</button>
                </div>
            </div>
        </div>
    </div>
    <script src="js/board.js"></script>
</body>

</html>