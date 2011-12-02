var socket = io.connect();
socket.on('render', function (data) {
    $('#content').html(data.html);
});
socket.on('title', function (data) {
    $('title').text(data.title);
});
socket.on('error', function (data) {
    console.log(data);
});
socket.on('file info', function (data) {
    console.log(data);
});
$(document).ready(function() {
    $('#disconnect').on('click', function(){
        socket.emit('logout');
    });
    $(document).on('click', 'li', function(){
        socket.emit('file info', {filepath: $(this).data('filepath')});
    });
});
