let socket = io();
let status = $('#status')[0];
let statusDefault = status.textContent;
let limit = 0;
let counter = 0;

$('.prev').on('click', function(event){
    event.preventDefault();
    if (limit != 0) {
        limit--;
        $.ajax({
            url: 'http://localhost:8000/api/messages/list/' + limit,
            type: 'GET',
            dataType: 'json',
            success: function (res) {
                if (limit == 0) {
                    $('.prev').css('display', 'none');
                }
                $('.odd').remove();
                for (let i = 0; i < res.length; i++) {
                    $(`<p class="odd"><span>${res[i].author}:</span> ${res[i].message}</p>`).appendTo($('#chat-list'));
                }
                $('.next').css('display', 'inline');
            }
        });
    }
});
$('.next').on('click', function(event){
    event.preventDefault();
    limit++;
    $.ajax({
        url: 'http://localhost:8000/api/messages/list/' + limit,
        type: 'GET',
        dataType: 'json',
        success: function (res) {
            $('.prev').css('display', 'inline');
            $('.odd').remove();
            for (let i = 0; i < res.length; i++) {
                $(`<p class="odd"><span>${res[i].author}:</span> ${res[i].message}</p>`).appendTo($('#chat-list'));
            }
            if (res.length < 10) {
                $('.next').css('display', 'none');
            }
        }
    });
});
$('#chat-msg').on('keydown', function(event) {
    if (event.which === 13 && event.shiftKey == false){
        handleForm();
        event.preventDefault();
    }
});
$('#chat-msg').on('keyup', function() {
    counter = this.value.length;
    $('#counter').text(counter);
});
$('.send-btn').on('click', function(event) {
    handleForm();
    event.preventDefault();
});
function handleForm() {
    if (socket !== undefined) {
        if ($('.odd').length === 10) {
            eventFire($('.next')[0], 'click');
        }
        socket.emit('input', {
            author: $('#chat-author').val(),
            message: replaceString($('#chat-msg').val())
        });
        counter = 0;
        $('#chat-msg').val('');
    }
    return (false);
}
function setStatus(s){
    if (s !== 'Message sent') {
        status.textContent = s;
    }
    if (s !== statusDefault) {
        var delay = setTimeout(function() {
            setStatus(statusDefault);
        }, 4000);
    }
}
function eventFire(element, eventType) {
    if (element.fireEvent) {
        element.fireEvent('on' + eventType);
    } else {
        let eventObj = document.createEvent('Events');
        eventObj.initEvent(eventType, true, false);
        element.dispatchEvent(eventObj);
    }
}
function replaceString(str) {
    let left = /</gi;
    let right = />/gi;

    let newString = str.replace(left, '&lt;');
    newString = newString.replace(right, '&gt;');

    return (newString);
}
if (socket !== undefined) {
    socket.on('output', function(data) {
        if (data.length) {
            for (let i = 0; i < data.length; i++) {
                $(`<p class="odd"><span>${data[i].author}:</span> ${data[i].message}</p>`).appendTo($('#chat-list'));
            }
        }
    });
    socket.on('status', function(data) {
        setStatus((typeof data === 'object') ? data.message : data);
        if (data.done) {
            $('#chat-msg').val('');
        }
    });
}
$.ajax({
    url: 'http://localhost:8000/api/messages/count',
    type: 'GET',
    dataType: 'json',
    success: function (res) {
        if (res.count > 10) {
            limit = parseInt(res.count / 10);
            $('.prev').css('display', 'inline');
        }
    }
})
