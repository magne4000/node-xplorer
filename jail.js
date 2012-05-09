var unixlib = require('unixlib'),
    passwd = require('passwd'),
    fs = require('fs'),
    posix = require('posix'),
    methods = {
        'file stat': function(data){
            fs.stat(data.filepath, function(err, stats){
                process.send({
                    action: data.action,
                    data: stats,
                });
            });
        },
        'file read': function(data){
            var stats = fs.statSync(data.filepath);
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
                fs.readFile(data.filepath, 'utf-8', function (err, content) {
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

function jail(username, password){
    unixlib.pamauth('system-auth', username, password, function(result) {
        if (result) {
            console.log('User %s logged !', username);
            passwd.get(username, function(user){
                process.title = 'node-xplorer-jailed-'+username;
                try {
                    process.chdir(user.homedir);
                    posix.chroot(user.homedir);
                    process.setgid(parseInt(user.groupId, 10));
                    process.setuid(parseInt(user.userId, 10));
                    console.log('Subprocess successfully jailed by ' + username + ' ('+process.getuid()+':'+process.getgid()+')');
                    process.send({success: true, args:{user: user}});
                } catch (err) {
                    console.log(err);
                    process.send({success: false});
                }
            });
        }else{
            process.send({success: false});
        }
    });
}

process.on('message', function(m){
    if (!!m.action){
        methods[m.action](m.data);
    }else{
        jail(m.username, m.password);
    }
});
