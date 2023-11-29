<?php
function connectToDB()
{
    include('connectdb.php');
    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    return $conn;
}

function disconnectDB($conn)
{
    // Do before disconnecting database
    // Disconnect database
    $conn->close();
}
