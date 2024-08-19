<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/login.css">
    <title>Login Page</title>
</head>

<?php
    include("header.php");

    session_start();

    $conn = mysqli_connect("localhost", "root", "1234", "chess"); # or dir("connection failed");

    //에러 메세지 
    if(mysqli_connect_errno() == 0 ) {
        echo mysqli_connect_error();
    }

    $failed = 0;
    if(isset($_POST['id']) && isset($_POST['pw'])) {
        $id = $_POST['id'];
        $pw_hashed = hash('sha256', $_POST['pw']);

        $query = "select * from user where user_id='{$id}' and user_pw='{$pw_hashed}'";
        $result = mysqli_query($conn, $query);
    
        if(mysqli_num_rows($result)) {
            $row = mysqli_fetch_assoc($result);
            echo "Login Success!";

            $_SESSION['user_id'] = $row['user_id'];
            $_SESSION['user_pw'] = $row['user_pw'];
            $_SESSION['user_signup_datetime'] = $row['user_signup_datetime'];

            $_SESSION['user_win_cnt'] = $row['user_win_cnt'];
            $_SESSION['user_draw_cnt'] = $row['user_draw_cnt'];
            $_SESSION['user_lose_cnt'] = $row['user_lose_cnt'];

            header("Location: index.php");
        }
        else {
            $failed = 1;
        }
    }

    mysqli_close($conn);
?>

<body>
    <div id="hello">
        <h1>Hello, Chess!</h1>
    </div>

    <h2>Login</h2>
    <form action="login.php" method="post">
        <table>
            <tr>
                <td>Id</td>
                <td> : <input type="text" name="id" placeholder="input id" required></td>
            </tr>
            <tr>
                <td>Password</td>
                <td> : <input type="password" name="pw" placeholder="input password" required></td>
            </tr>
        </table>
        <input type="submit" name="submit" value="login">
    </form><br>

    <?php
        if($failed) {
            echo "<span style='color: red;'>Login Failed</span><br>"; # span id='login_faild' 이거 왜 안됨 ??!
        }
    ?>
    <a href="signup.php">Sign up</a>
</body>

</html>