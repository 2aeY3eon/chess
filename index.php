<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home</title>
    <link rel="stylesheet" href="public/css/index.css">
</head>

<body>
    <?php
        include("header.php");
    ?>
    <h1>Chess home</h1>

    <div id="main">
    <?php
        session_start();

        if(isset($_SESSION['user_id'])) {
            $id = $_SESSION['user_id'];
            $datetime = $_SESSION['user_signup_datetime'];
        
            $win_cnt = $_SESSION['user_win_cnt'];
            $draw_cnt = $_SESSION['user_draw_cnt'];
            $lose_cnt = $_SESSION['user_lose_cnt'];

            $total_cnt = $win_cnt + $draw_cnt + $lose_cnt;

            $host_name = $_SERVER['HTTP_HOST'];
            
            echo "<p>Hello, {$id}!</p>";
            echo "<p>회원가입 날짜 : {$datetime}</p>";
            echo "<p>총 게임 횟수 : {$total_cnt}</p>";
            echo "<p>승 : {$win_cnt}</p>";
            echo "<p>무 : {$draw_cnt}</p>";
            echo "<p>패 : {$lose_cnt}</p>";
            echo "<a href='http://{$host_name}:8000/board?n={$id}'>게임하러 가기!</a><br>";
            echo "<button onclick='help()'>도움말</button><br>";
            echo "<a href='logout.php'>Logout</a><br>";
        }
        else {
            echo "U Seem Not Login! Plz Login<br>";
            echo "<a href='login.php'>Login</a>";
        }
    ?>
    </div>

    <script>
        function help() {
            let helpMsg = [
                "룩은 수직으로 공격할 수 있습니다.",
                "비숍의 스펠링은 B i s h o p 입니다.",
                "체크메이트 되면 패배합니다.",
                "제한시간은 30초입니다. 그 안에 기물을 두지 못하면 패배합니다.",
                "체스의 정점엔 문부일이 존재합니다.",
                "이 프로젝트는 엔트리를 사용하지 않았습니다",
                "킹의 이미지들은 실제 인물이 아닙니다.",
                "이 프로젝트의 버그를 찾지 마세요.",
                "체스판의 크기는 8*8입니다."
            ];
            let helpMsgCnt = helpMsg.length;

            randNum = Math.floor(Math.random() * helpMsgCnt);

            alert(`도움말\n\n${helpMsg[randNum]}`);
        }
    </script>
</body>

</html>