var express = require('express');
var app = express();

app.use('/', express.static(__dirname + '/public'));

app.get('/else', function(req, res){
  res.send('some website');
});
app.get('*', function(req, res){
	res.send('404 not found');
});

app.listen(5000, function(){
	console.log('App listening on port 5000')
});