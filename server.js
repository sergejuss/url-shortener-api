var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use('/', express.static(__dirname + '/public'));

app.get('/else', function(req, res){
  res.send('some website');
});
app.get('*', function(req, res){
	res.send('404 not found');
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});