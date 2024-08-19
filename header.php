<link rel="stylesheet" href="css/header.css">
<header id="header" style="justify-content: left;">
    <a href="index.php"><img src="images/unifox.png" width="200"></a>
</header>

<?php
//캐시 저장 X
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header("Expires: Thu, 19 Nov 1981 08:52:00 GMT");
?>