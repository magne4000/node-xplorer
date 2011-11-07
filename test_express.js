var express = require('express'),
    unixlib = require('unixlib'),
    fs = require('fs'),
    passwd = require('passwd'),
    app = express.createServer();

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


function jail(req, res, username, password, cb){
    unixlib.pamauth('system-auth', username, password, function(result) {
        if (result) {
            console.log('User %s logged !', username);
            passwd.get(username, function(user){
                //process.setgid(parseInt(user.groupId, 10));
                //process.setuid(parseInt(user.userId, 10));
                //console.log('Subprocess owned by '+process.getuid()+':'+process.getgid());
                cb(user);
            });
        }else{
            res.render('login.jade', {title: "Not logged", text: ":("});
        }
    });
}


app.get('/', function(req, res){
    if (req.session.auth){
        console.log(process.env.HOME);
        fs.readdir(process.env.HOME, function(err, files){
            console.log('rendering index');
            res.render('index.jade', {title: "Logged", text: ":)", files: files});
        });
    }else{
        console.log('rendering login');
        res.render('login.jade', {title: "Login"});
    }
});

app.post('/login/', function(req, res){
    jail(req, res, req.body.user.name, req.body.user.password, function(user){
        req.session.auth = true;
        res.redirect('/');
    });
});

app.listen(1337);
console.log('Express server started on port %s', app.address().port);
