(function( $ ) {
    var modes = {
        'javascript': false,
        'xml': false
    },
    set = function(mode){
        if (!!mode && !modes[mode]){
            load(mode);
            modes[mode] = true;
        }
        cm.setOption('mode', mode);
    },
    load = function(mode){
        $('<script/>')
            .attr('type', 'text/javascript')
            .attr('src', '/codemirror/mode/'+mode+'/'+mode+'.js')
            .appendTo('head');
    };

    $(document).on('newfile', '#editor', function(event, filename){
        var ext = filename.split('.').pop();
        switch(ext){
            case 'js':
                set('javascript');
                break;
            case 'xml':
            case 'xsd':
                set('xml');
                break;
            case 'css':
                set('css');
                break;
            case 'htm':
            case 'html':
                set('htmlmixed');
                break;
            case 'less':
                set('less');
                break;
            case 'php':
                set('php');
                break;
            case 'py':
                set('python');
                break;
            default:
               set(null); 
        }
    });
})( jQuery );
