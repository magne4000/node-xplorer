var socket = io.connect(),
    methods = {
        'render': function(data){
            $('#content').html(data.html);
        },
        'title': function(data){
            $('title').text(data.title);
        },
        'error': function(data){
            console.log(data);
        },
        'file stat': function(data){
            console.log(data);
        }
    };
function emit(action, data){
    data = data || {};
    data.action = action;
    socket.send(JSON.stringify(data));
}

function receive(action, data){
    methods[action](data);
}

socket.on('message', function (data) {
    data = JSON.parse(data);
    receive(data.action, data);
});

$(document).ready(function() {
    $('#loginform').on('submit', function (event){
        event.preventDefault();
        emit('login', {username: $('input[name="user[name]"]').val(), password: $('input[name="user[password]"]').val()});
    });
    $('#disconnect').on('click', function(){
        emit('logout');
    });
    $(document).on('click', 'li', function(){
        emit('file stat', {filepath: $(this).data('filepath')});
    });
});
