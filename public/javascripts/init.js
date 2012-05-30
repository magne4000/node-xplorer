var socket = io.connect(),
    cm = null,
    methods = {
        'render': function(data){
            for (var i=0; i<data.length; i++){
                if (data[i].action){
                    if (data[i].action == 'append'){
                        $(data[i].target).append(data[i].html);
                    }else if (data[i].action == 'prepend'){
                        $(data[i].target).prepend(data[i].html);
                    }
                }else{
                    $(data[i].target).html(data[i].html);
                }
                if (data[i].target.indexOf('#arbo' === 0)){
                    if (data[i].target.indexOf('data-filepath') === -1){
                        //root folder
                        $('#arbo').jstree({
                            "plugins" : ["ui","html_data","crrm","hotkeys","themeroller"]
                        })
                        .on("select_node.jstree", function (event, data) {
                            // `data.rslt.obj` is the jquery extended node that was clicked
                            if (data.rslt.obj.hasClass('jstree-leaf')){
                                emit('file read', {filepath: data.rslt.obj.data('filepath')});
                            }
                        });
                    }
                    $('#arbo').jstree('clean_node', data[i].target);
                    $('#arbo').jstree('open_all', data[i].target);
                }
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

$.jstree._themes = '/themes/jstree/';

$(document).ready(function() {

    $('body').layout({ applyDefaultStyles: true });

    /*jQueryUI Theming*/
    $('button, input:submit').livequery(function(){
        $(this).button();
    });
    
    /*Editor*/
    $('#editor').livequery(function(){
        cm = CodeMirror.fromTextArea($(this).get(0));
        $(this).trigger('create');
    });

    $('#loginform').on('submit', function (event){
        event.preventDefault();
        emit('login', {username: $('input[name="user[name]"]').val(), password: $('input[name="user[password]"]').val()});
    });
    $('#disconnect').on('click', function(){
        event.preventDefault();
        emit('logout');
    });
});
