<?php
// FUNCS START
include_once('database-connections.php');
function GetLatestDate()
{
    $conn = connectToDB();

    $stmt = $conn->prepare('SELECT * FROM viestit2 ORDER BY pvm DESC LIMIT 1');
    $stmt->execute();

    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $date = $row['pvm'];
    }

    disconnectDB($conn);
    return $date;
}

function GetNewByDate($newerThan, $upTo)
{
    $conn = connectToDB();

    $stmt = $conn->prepare("SELECT * FROM `viestit2` WHERE `pvm` BETWEEN ? AND ?");
    $stmt->bind_param('ss', $newerThan, $upTo);
    $stmt->execute();

    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $newMessages[] = $row;
    }

    disconnectDB($conn);
    return $newMessages;
}
?>

<?php
// MAIN
header("Content-type: text/event-stream");
header("Cache-Control: no-cache");
ob_end_flush();

const BASE_SLEEP_MS = 100;
const SLEEP_CAP_MS = 10000;
const MS_TO_MU = 1000;

$sleepMS = BASE_SLEEP_MS;
$latestMessageDate = GetLatestDate();
while (true) {
    $compareDate = GetLatestDate();
    if ($compareDate > $latestMessageDate) {
        $messages = GetNewByDate($latestMessageDate, $compareDate);
        echo "event: message\n";
        echo "data:" . json_encode($messages) . "\n\n";
        flush();
        $latestMessageDate = $compareDate;
        $sleepMS = BASE_SLEEP_MS;
    }

    if (connection_aborted()) break;

    if ($sleepMS >= SLEEP_CAP_MS) $sleepMS = SLEEP_CAP_MS;
    else $sleepMS *= 1.1;
    usleep($sleepMS * MS_TO_MU);
}
?>