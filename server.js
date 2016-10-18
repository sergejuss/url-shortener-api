var express = require('express');
var app = express();

app.use('/', express.static(__dirname + '/public'));

app.get('/else', function(req, res){
  res.send('some website');
});

app.listen(8080, function(){
	console.log('App listening on port 8080')
});