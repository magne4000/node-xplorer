var unixlib = require('unixlib'),
    passwd = require('passwd'),
    fs = require('fs'),
    methods = {
        'file stat': function(data){
            fs.stat(data.filepath, function(err, stats){
                process.send({
                    action: data.action,
                    data: stats
                });
            });
        }
    };

function jail(username, password){
    unixlib.pamauth('system-auth', username, password, function(result) {
        if (result) {
            console.log('User %s logged !', username);
            passwd.get(username, function(user){
                process.setgid(parseInt(user.groupId, 10));
                process.setuid(parseInt(user.userId, 10));
                console.log('Subprocess owned by '+process.getuid()+':'+process.getgid());
                process.send({success: true, args:{user: user}});
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
