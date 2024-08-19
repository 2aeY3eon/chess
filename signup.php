<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/login.css">
    <title>Sign up</title>
</head>

<?php
include("header.php");

session_start();

$conn = mysqli_connect("localhost", "root", "1234", "chess"); # or dir("connection failed");

//에러 메세지 
if (mysqli_connect_errno() == 0) {
    echo mysqli_connect_error();
}

if (isset($_POST['id']) && isset($_POST['pw'])) {
    $id = $_POST['id'];
    $pw_hashed = hash('sha256', $_POST['pw']);

    $query = "select user_id from user where user_id='{$id}'";
    $result = mysqli_query($conn, $query);

    if (mysqli_num_rows($result)) {
        echo "<script>alert('Sign up failed\\nId is already exists!');</script>";
    } else {
        $query = " insert into user(
                user_id, 
                user_pw, 
                user_win_cnt, 
                user_draw_cnt, 
                user_lose_cnt, 
                user_signup_datetime
            ) 
            values(
                '{$id}', 
                '{$pw_hashed}',
                0,
                0,
                0,
                now()
            )";

        mysqli_query($conn, $query);

        echo "<script>alert('Successfuly Signed up!'); location.href='login.php';</script>";
    }
}


mysqli_close($conn);


?>

<body>
    <div id="hello">
        <h1>Hello, Chess!</h1>
    </div>
    <h2>Sign up</h2>
    <form action="signup.php" method="post">
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
        <input type="submit" name="submit" value="signup">
    </form><br>
    <a href="/login.php">Sign in</a>
</body>

</html>