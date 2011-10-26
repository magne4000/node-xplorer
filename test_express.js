var express = require('express'),
    app = express.createServer(
      express.logger(),
      express.bodyParser(),
      express.methodOverride()
    );

app.set('view engine', 'jade'); // Set jade as default render engine
app.get('/', function(req, res){
  res.render('index.jade', {title: "My first NodeJS app", text: "Hello World. This is my first NodeJS app"});
});
app.listen(1337);
console.log('Express server started on port %s', app.address().port);
