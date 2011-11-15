var express = require('express'),
    cp = require('child_process'),
    fs = require('fs'),
    app = express.createServer()
    io = require('socket.io').listen(app),
    _res = null;

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
    app.use(express.cookieParser());
    app.use(express.session({ secret: "I iz secret passphrase !" }));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.set('view engine', 'jade'); // Set jade as default render engine

function jail(args, success, fail){
    var child = cp.fork(__dirname + '/jail.js'), callbacks = {};
    child.send(args);
    child.on('message', function(m){
        if (!!m.action){
            if (!!callbacks[m.action]){
                callbacks[m.action](m.data);
            }
        }else{
            if (!!m.success){
                success(m.args);
            }else{
                fail();
            }
        }
    });

    this.kill = function(socket){
        _res.partial('login', {title: "Login"}, function(err, str){
            socket.emit('render', {html: str});
        });
        child.kill('SIGTERM');
    };

    this.jailed = function(action, data, callback){
        callbacks[action] = callback;
        child.send({
            action: action,
            data: data
        });
    };

    return this;
}

function login(username, password, socket){
    var unixlib = require('unixlib'), oJail;
    unixlib.pamauth('system-auth', username, password, function(result) {
        if (result){
            //Jail user !
            oJail = jail({username: username, password: password},
                function(args){
                    socket.emit('title', {title: 'Logged'});
                    fs.readdir(args.user.homedir, function(err, files){
                        _res.partial('index', {files: files, rootfolder: args.user.homedir}, function(err, str){
                            socket.emit('render', {html: str});
                        });
                    });
                },
                function(){
                    socket.emit('title', {title: 'not logged'});
                    socket.emit('error', {message: 'Wrong credentials'})
                }          
            );
            socket.set('jail', oJail);
        }
    });
}

function logout(socket){
    socket.get('jail', function (err, oJail){
        if (!!oJail){
            oJail.kill(socket);
        }
    });
}

function performJailedAction(action, data, socket, callback){
    socket.get('jail', function (err, oJail){
        if (!!oJail){
            oJail.jailed(action, data, callback);
        }
    });
}

io.sockets.on('connection', function (socket) {
    socket.on('login', function (data) {
        login(data.username, data.password, socket);
    });

    socket.on('logout', function (data) {
        logout(socket);
    });

    socket.on('disconnect', function (data) {
        logout(socket);
    });

    socket.on('file info', function (data) {
        performJailedAction('file info', data, socket, function(args){
            socket.emit('file info', {data: args});
        });
    });
});

app.get('/', function(req, res){
    _res = res;
    res.render('login.jade', {title: "Login"});
});

app.listen(1337);
console.log('Express server started on port %s', app.address().port);
