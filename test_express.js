var express = require('express'),
    cp = require('child_process'),
    fs = require('fs'),
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

function jail(args, success, fail){
    var child = cp.fork(__dirname + '/jail.js');
    child.send(args);
    child.on('message', function(m){
        if (!!m.success){
            success(m.args);
        }else{
            fail();
        }
        child.kill('SIGTERM');
    });
}

app.get('/', function(req, res){
    if (req.session.auth){
        console.log(process.env.HOME);
        jail({username: req.session.username, password: req.session.password},
            function(args){
                fs.readdir(args.user.homedir, function(err, files){
                    res.render('index.jade', {title: "Logged", text: ":)", files: files});
                });
            },
            function(){
                res.render('login.jade', {title: "Not logged", text: ":("});
            }
        );
    }else{
        res.render('login.jade', {title: "Login"});
    }
});

app.post('/login/', function(req, res){
    jail({username: req.body.user.name, password: req.body.user.password},
        function(child){
            req.session.auth = true;
            req.session.username = req.body.user.name;
            req.session.password = req.body.user.password;
            res.redirect('/');
        },
        function(child){
            res.render('login.jade', {title: "Not logged", text: ":("});
        }
    );
});

app.listen(1337);
console.log('Express server started on port %s', app.address().port);
