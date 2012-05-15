var socket = io.connect(),
    cm = null,
    methods = {
        'render': function(data){
            $('#left-menu').html(data.html);
            $('#content').html('<div id="editor"></div>');
            cm = CodeMirror.fromTextArea($('#editor').get(0));
            $('#editor').trigger('create');
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

$(document).ready(function() {

    $('body').layout({ applyDefaultStyles: true });

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
