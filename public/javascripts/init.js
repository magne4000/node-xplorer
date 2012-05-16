var socket = io.connect(),
    cm = null,
    methods = {
        'render': function(data){
            for (var i=0; i<data.length; i++){
                $(data[i].target).html(data[i].html);
            }
        },
        'title': function(data){
            $('title').text(data.title);
        },
        'error': function(data){
            console.log(data);
        },
        'file stat': function(data){
            console.log(data);
        },
        'file read': function(data){
            cm.setValue(data.content);
            $('#editor').trigger('newfile', data.filepath);
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
    receive(data.action, data.data);
});

socket.on('disconnect', function() {
    console.log('disconnect');
});

socket.on('connect_failed', function() {
    console.log('connect_failed');
});

socket.on('error', function() {
    console.log('error');
});

socket.on('reconnect_failed', function() {
    console.log('reconnect_failed');
});

socket.on('reconnect', function() {
    console.log('reconnect');
});

$(document).ready(function() {

    $('body').layout({ applyDefaultStyles: true });

    /*jQueryUI Theming*/
    $('button, input:button').livequery(function(){
        $(this).button();
    });

    $('#editor').livequery(function(){
        cm = CodeMirror.fromTextArea($(this).get(0));
        $(this).trigger('create');
    });

    $('#loginform').on('submit', function (event){
        event.preventDefault();
        emit('login', {username: $('input[name="user[name]"]').val(), password: $('input[name="user[password]"]').val()});
    });
    $('#disconnect').on('click', function(){
        emit('logout');
    });
    /*$(document).on('click', 'li', function(){
        emit('file stat', {filepath: $(this).data('filepath')});
    });*/
    $(document).on('click', 'li', function(){
        emit('file read', {filepath: $(this).data('filepath')});
    });
});
