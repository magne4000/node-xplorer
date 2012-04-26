(function( $ ) {
    var modes = {
        'javascript': false,
        'xml': false
    },
    load = function(mode){
        if (!modes[mode]){
            _load(mode);
            modes[mode] = true;
        }
    },
    _load = function(mode){
        $('<script/>')
            .attr('type', 'text/javascript')
            .attr('src', '/codemirror/mode/'+mode+'/'+mode+'.js')
            .appendTo('head');
    };

    $(document).on('newfile', '#editor', function(filename){
        var ext = filename.split('.').pop();
        switch(ext){
            case 'js':
                load('javascript');
                break;
            case 'xml':
                load('xml');
                break;
        }
    });
})( jQuery );
