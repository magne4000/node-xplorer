var fs = require('fs');
var methods = {
    'file stat': function(data){
        fs.stat(data.filepath, function(err, stats){
            process.send({
                action: data.action,
                data: stats,
            });
        });
    },
    'file read': function(data){
        var stats;
        try {
            stats = fs.statSync(data.filepath);
        } catch (err) {
            process.send({
                action: 'error',
                data: err.name + ' : ' + err.message
            });
            return;
        }
        if (stats.isDirectory()){
            fs.readdir(data.filepath, function (err, files) {
                var ret = {
                    'files': files,
                    'filepath': data.filepath
                };
                process.send({
                    partial: 'filelist',
                    action: 'render',
                    data: ret,
                });
            });
        }else if(stats.isFile()){
            fs.readFile(data.filepath, 'utf8', function (err, content) {
                var ret = {
                    'content': content,
                    'filepath': data.filepath
                };
                process.send({
                    action: data.action,
                    data: ret,
                });
            });
        }
    }
};

exports.methods = methods;
