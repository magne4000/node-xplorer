var express = require('express'),
    unixlib = require('unixlib'),
    fs = require('fs'),
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
    res.render('login.jade', {title: "Login"});
});

app.post('/login/', function(req, res){
    unixlib.pamauth('system-auth', req.body.user.name, req.body.user.password, function(result) {
        if (result) {
            console.log('User %s logged !', req.body.user.name);
            fs.readdir(process.env.HOME, function(err, files){
                console.dir(files);
                res.render('index.jade', {title: "Logged", text: ":)", files: files});
            });
        }else{
            res.render('index.jade', {title: "Not logged", text: ":("});
        }
    });
});
app.listen(1337);
console.log('Express server started on port %s', app.address().port);
