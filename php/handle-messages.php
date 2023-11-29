<?php
// FUNCTIONS
error_reporting(E_ALL);
ini_set('display_errors', 1);
include_once('database-connections.php');

function validateString($input)
{
    $s = htmlspecialchars(stripslashes(trim($input)));
    $s = str_replace("/", "", $s);
    $s = str_replace("\\", "", $s);
    return $s;
}

// Return int = success, return string = fail, value = reason
function validateFile($files, $fileToUpload, $sizeLimit)
{
    $tarPath = basename($files[$fileToUpload]["name"]);
    $fileType = strtolower(pathinfo($tarPath, PATHINFO_EXTENSION));

    $check = getimagesize($files[$fileToUpload]["tmp_name"]);

    if ($check === false)
        return ("file is not an image.");

    if ($files[$fileToUpload]["size"] > $sizeLimit)
        return ("File too large! Limit: 500 KB");

    if ($fileType != "jpg" && $fileType != "png" && $fileType != "jpeg" && $fileType != "gif")
        return ("Invalid file type.");

    if (file_exists($tarPath))
        return (1);

    return 0;
}

function getMessages($num)
{
    $conn = connectToDB();
    $stmt = $conn->prepare('SELECT * FROM viestit2 ORDER BY id DESC LIMIT ?');
    $stmt->bind_param('i', $num);

    $stmt->execute();

    $result = $stmt->get_result();

    if ($result->num_rows <= 0) return null;

    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
    }

    disconnectDB($conn);
    return $items;
}

function sendMessage($name, $message, $img)
{
    // Get current date and time
    $datetime = new DateTime("now");
    $date = $datetime->format("Y-m-d H:i:s.u");
    $date = substr($date, 0, -3); // millisecond accuracy to 3 digits so that it fits the database.

    $conn = connectToDB();
    $stmt = $conn->prepare("INSERT INTO viestit2 (nimi, pvm, viesti, kuva) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $name, $date, $message, $img);
    $stmt->execute();

    disconnectDB($conn);
}
?>

<?php
// MAIN
if (isset($_POST['updateMessages2']) && (int)$_POST['updateMessages2'] === 1) {
    $messages = getMessages(validateString((int)$_POST['numMessages']));
    if ($messages === null) exit(json_encode(array('PHPERROR' => 'No messages found')));
    echo (json_encode($messages));
}

if (isset($_POST['inputMessage'])) {
    $name = validateString($_POST['inputName']);
    $message = validateString($_POST['inputMessage']);

    if (basename($_FILES["inputPicture"]["name"]) == "") {
        $filePath = "empty.jpg";    // use default if empty
    } else {
        $validateResult = validateFile($_FILES, "inputPicture", 500000);
        if (!is_int($validateResult))
            exit(json_encode(array('PHPERROR' => $validateResult)));
        else if ($validateResult === 0) {
            $filePath = basename($_FILES["inputPicture"]["name"]);
            $mediaFolder = "../media/";
            move_uploaded_file($_FILES["inputPicture"]["tmp_name"], $mediaFolder . $filePath);
        }
    }

    // Upload to database
    sendMessage($name, $message, $filePath);
}
?>
