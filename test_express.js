var express = require('express'),
    unixlib = require('unixlib'),
    fs = require('fs'),
    passwd = require('passwd'),
    nix = require('nix'),
    app = express.createServer();

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.set('view engine', 'jade'); // Set jade as default render engine
app.get('/', function(req, res){
    console.log('Subprocess owned by '+process.getuid()+':'+process.getgid());
    res.render('index.jade', {title: "Login"});
});

app.post('/login/', function(req, res){
    console.log('Subprocess owned by '+process.getuid()+':'+process.getgid());
    unixlib.pamauth('system-auth', req.body.user.name, req.body.user.password, function(result) {
        if (result) {
            console.log('User %s logged !', req.body.user.name);
            var pid = nix.fork();
            if (pid == 0) {
                // this is the child process, pid = 0
                passwd.get(req.body.user.name, function(user){
                    process.setgid(parseInt(user.groupId, 10));
                    process.setuid(parseInt(user.userId, 10));
                    console.log('Subprocess owned by '+process.getuid()+':'+process.getgid());
                    fs.readdir(user.homedir, function(err, files){
                        res.render('login.jade', {title: "Logged", text: ":)", files: files});
                    });
                });
            } else {
                res.destroy();
            }
        }else{
            res.render('login.jade', {title: "Not logged", text: ":("});
        }
    });
});
app.listen(1337);
console.log('Express server started on port %s', app.address().port);
