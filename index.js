var express = require('express'),
    cp = require('child_process'),
    fs = require('fs'),
    less = require('connect-less'),
    app = express.createServer(),
    io = require('socket.io').listen(app),
    _res = null;

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', { layout: false });
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(less({ src: __dirname + '/public/' }));
    app.use(express.cookieParser("secret"));
    app.use(express.session({ secret: "I iz secret passphrase ! (change me!)" }));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

// Modify received data from jailed process
// and send them to client
var alterAndSend = function(socket, args) {
    //On jailed mode, must set data.action = 'render' in order to
    //render result with _res.partial
    if (!!args.action){
        if (args.action == 'render'){
            _res.partial('includes/partial/' + args.partial, {files: args.data.files, rootfolder: args.data.filepath}, function(err, str){
                socket.send(JSON.stringify({action: 'render', data: {html: str}}));
            });
        }else{
            socket.send(JSON.stringify({action: args.action, data: args.data}));
        }
    }
},
jail = function(args, socket, success, fail){
    var child = cp.fork(__dirname + '/jail.js'), isLogged = false, mysocket = socket;
    child.send(args);
    child.on('message', function(m){
        if (isLogged){
            //Data received by child process altered by server
            //and then sent to client
            alterAndSend(socket, m);
        }else{
            if (!!m.success){
                success(m.args);
                isLogged = true;
            }else{
                fail();
                isLogged = false;
            }
        }
    });

    this.kill = function(socket){
        _res.partial('includes/partial/login', {title: "Login"}, function(err, str){
            socket.send(JSON.stringify({action: 'render', html: str}));
        });
        child.kill('SIGTERM');
    };

    this.jailed = function(data, socket){
        child.send({
            action: data.action,
            data: data
        });
    };

    return this;
};

function login(username, password, socket){
    var unixlib = require('unixlib'), oJail;
    unixlib.pamauth('system-auth', username, password, function(result) {
        if (result){
            //Jail user !
            oJail = jail({username: username, password: password},
                socket,
                function(args){
                    socket.send(JSON.stringify({action: 'title', data: {title: 'Logged'}}));
                    fs.readdir(args.user.homedir, function(err, files){
                        _res.partial('includes/partial/filelist', {files: files, rootfolder: args.user.homedir}, function(err, str){
                            socket.send(JSON.stringify({action: 'render', data: {html: str}}));
                        });
                    });
                },
                function(){
                    socket.send(JSON.stringify({action: 'title', data: {title: 'not logged'}}));
                    socket.send(JSON.stringify({action: 'error', data: {message: 'Wrong credentials'}}));
                }          
            );
            socket.set('jail', oJail);
        }else{
            socket.send(JSON.stringify({action: 'title', data: {title: 'not logged'}}));
            socket.send(JSON.stringify({action: 'error', data: {message: 'Wrong credentials'}}));
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

function performJailedAction(data, socket){
    socket.get('jail', function (err, oJail){
        if (!!oJail){
            oJail.jailed(data, socket);
        }
    });
}

io.set('log level', 1); //No more debug output
io.sockets.on('connection', function (socket) {

    socket.on('disconnect', function (data) {
        logout(socket);
    });

    socket.on('message', function (data) {
        data = JSON.parse(data);
        if(data.action == 'login'){
            login(data.username, data.password, socket);
        }else if (data.action == 'logout'){
            logout(socket);
        }else{
            performJailedAction(data, socket);
        }
    });
});

app.get('/', function(req, res){
    _res = res;
    res.render('use', {title: "Login", content: "login"});
});

app.listen(1337);
console.log('Express server started on port %s', 1337);
