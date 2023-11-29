import { Message } from './message.js';

// Main
$(document).ready(function () {
    // ON START
    // Establish SSE connection for receiving messages.
    const eventSource = new EventSource("./php/SSE-messages.php");
    eventSource.onmessage = async (event) => {
        let results = JSON.parse(event.data);
        await results.forEach((message) => AddNewMessage(message));
        await scrollToBottom();
    };

    // Remove on enter animations to make sure they do not play again
    document.getElementById('messages').addEventListener("animationend", function () {
        console.log("animation done");
        $('.testAnim').removeClass('testAnim');
    }, false);

    requestLatestMessages(50, 0);   // Get messages on load
    changePicture(document.getElementById('inputPicture'));  // Apply last avatar
    clearFields();  // Clear fields on refresh
    // ON START FINISH

    // EVENTS
    // On send message
    $("#chatForm").submit(function (event) {

        // Button click animation
        $("#sendMessage").addClass('sendButtonAnim');
        document.getElementById('sendMessage').addEventListener('animationend', function () {
            $('#sendMessage').removeClass('sendButtonAnim');
        }, false);

        event.preventDefault(); // Interrupt default post behavior
        // Ajax post
        $.ajax({
            type: 'POST',
            url: './php/handle-messages.php',
            data: new FormData(this),
            contentType: false,
            cache: false,
            processData: false,
            success: function (data) {
                // PHP EXIT WITH ERROR
                if (data.includes('PHPERROR')) {
                    let e = JSON.parse(data);
                    console.error(e['PHPERROR']);
                    $('#inputPictureLabel').css("box-shadow", "rgb(255, 15, 30) 0px 0px 8px 1px");
                    $('#errorText').text(e['PHPERROR']); // Set error message

                    // Display Error
                    $("#errorBox").addClass('errorTextEnter');
                    $("#errorBox").css('display', 'flex');
                    // Remove Error
                    document.getElementById('errorBox').addEventListener('animationend', function () {
                        $('#inputName').removeClass('errorTextEnter');
                        $("#errorBox").css('display', 'none');
                    }, false);
                } else { // SUCCESS
                    requestLatestMessages(1, true); // Might have a slight race condition, better to do fully locally?
                    scrollToBottom();
                    clearFields();
                }
            },
            error: function (e) {
                console.log(e)
            }
        });
    });

    // Update image preview
    document.getElementById('inputPicture').addEventListener('change', function () {
        changePicture(this);
        $('#inputPictureLabel').css("box-shadow", "0 0.5rem 1rem rgba(0, 0, 0, 0.15)");
    });

    // FUNCTIONS
    // "Manually" get {num} latest messages.
    function requestLatestMessages(num, scrollTime) {
        $.ajax({
            type: 'POST',
            url: './php/handle-messages.php',
            data: ({ updateMessages2: 1, numMessages: num }),
            success: function (data) {
                if (data.includes('PHPERROR')) { // ERROR
                    let e = JSON.parse(data);
                    console.error(e['PHPERROR']);
                } else {
                    let d = JSON.parse(data);
                    d = d.reverse();
                    for (let i = 0; i < d.length; i++) {
                        AddNewMessage(d[i]);
                    }

                    if (scrollTime >= 0) scrollToBottom(scrollTime);

                }
            },
            error: function (e) {
                console.log(e)
            }
        });
    }

});

// Parse messages
function AddNewMessage(input) {
    new Promise(() => {
        let entryPoint = document.getElementById('bottomPadding');
        let message = new Message(input['id'], input['kuva'], input['nimi'], FormatDate(input['pvm']), input['viesti']);
        message.displayBefore(entryPoint, 'messageTemplate');
    })
}

// Changes picture on the local UI element
function changePicture(input) {
    // return if null
    if (input.value == "") return;

    $('#inputPictureLabel').css("border", "0px none red");
    $('#imageError').css("display", "none");

    var reader = new FileReader();
    reader.readAsDataURL(input.files[0]);

    reader.onload = function (event) {
        //document.getElementById("inputPictureLabel").src = oFREvent.target.result;
        document.getElementById("inputPictureLabel").style.backgroundImage = 'url(' + event.target.result + ')';
    };
}

// Scroll to the bottom of the chat (animated)
function scrollToBottom(time) {
    return new Promise(() => {
        let height = document.getElementById('messages').scrollHeight;
        $('#messages').stop();
        $('#messages').animate({
            scrollTop: height
        }, time, 'linear');
    })
}

// Clears defined input fields
function clearFields() {
    document.getElementById('inputMessage').value = "";
}

// Date things
// Date formatting
function FormatDate(date) {
    let date1 = new Date(date);
    let d = new Date().toISOString();
    d = d.split("T");
    let date2 = new Date(d[0]);

    let splitDate = date.split("-");
    var daytime = splitDate[2].split(" ");

    if (date1 < date2) {
        let month = IntToMonth(splitDate[1] - 1);
        return month + " " + daytime[0];
    } else {
        // Month to string
        let timeArr = daytime[1].split(":");
        return timeArr[0] + ":" + timeArr[1];
    }

}

function IntToMonth(monthNumber) {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('en-US', {
        month: 'long',
    });
}