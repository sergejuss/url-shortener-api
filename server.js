var mongo = require('mongodb').MongoClient;
var url = process.env.MONGODB_URI;
var express = require('express');
var app = express();

var insertDoc = function(db, entry, callback){
	var collection = db.collection('urls');
	collection.insert(entry, function(err, result){
		if(err) console.log(err);
		else {
			console.log('Inserted one entry');
			//console.log(result.result);
			callback(result);
		}
	});
};
var findDocs = function(db, query, proj, callback){
	var collection = db.collection('urls');
	collection.find(query, proj).toArray(function(err, docs){
		if(err) console.log(err);
		else {
			//console.log('Found the following docs');
			//console.dir(docs);
			callback(docs);
		}
	});
};
var deleteDocs = function(db, query, callback){
	var collection = db.collection('urls');
	collection.remove(query, function(err, result){
		if(err) console.log(err);
		else {
			console.log('Succesfully deleted docs');			
			callback(result);
		}
	});
};

app.set('port', (process.env.PORT || 5000));

app.use('/', express.static(__dirname + '/public'));

app.get('/new/*', function(req, res){	
	var regexp = /^https?:\/\/[a-z]+.+\.[a-z]{2,3}(?:\:[\d]+)?$/i;	
	if (!regexp.test(req.originalUrl.slice(5))) {
		var bad = 'bad request \n' + req.originalUrl.slice(5);
		res.send({'error': 'Wrong url format, make sure you have a valid protocol and real site.'});
	} else {		
		mongo.connect(url, function(err, db){
			if(err) {
				console.log(err);
				res.send('Error connecting to the database');
			} else {
				console.log('db connected to', url);
				//deleteDocs(db, {}, function(){});
				var origUrlArray = [], shortUrlArray = [];
				findDocs(db, {}, {_id:0}, function(result){
					result.forEach(function(e){
						origUrlArray.push(e.original_url);
						shortUrlArray.push(e.short_url);
					});
					if (origUrlArray.indexOf(req.originalUrl.slice(5)) !== -1) {
						console.log('Such url allready exists');
						findDocs(db, {original_url: req.originalUrl.slice(5)}, {_id:0}, function(result){
							res.send({'error': 'This url allready exists in the database.', 'original_url': result[0]['original_url'],
								'short_url': ('https://sergejuss-url-shortener.herokuapp.com/'+result[0]['short_url'])});
						});						
					} else {
						var sUrlValue = 1;
						if (shortUrlArray.length>0) {
							sUrlValue = shortUrlArray.sort(function(a, b){return a-b;})[shortUrlArray.length-1] + 1;							
						}
						var entry = {original_url: req.originalUrl.slice(5), short_url: sUrlValue};
						insertDoc(db, entry, function(){							
							res.send({'original_url': req.originalUrl.slice(5),
								'short_url': ('https://sergejuss-url-shortener.herokuapp.com/'+sUrlValue)});
						});						
					}					
					db.close();					
				});
			}
		});		
	}
});

app.get(/[\d]+/, function(req, res){	
	mongo.connect(url, function(err, db){
		if(err) {
			console.log(err);
			res.send('Error connecting to the database');
		} else {
			console.log('db connected to', url);
			findDocs(db, {short_url: +req.path.slice(1)}, {_id:0}, function(result){
				if (result.length === 0) {
					res.send({'error': 'This url is not on the database.'});
				} else {					
					res.redirect(result[0]['original_url']);					
				}				
				db.close();
			});
		}
	});
});	

app.get('*', function(req, res){
	res.send({'error': 'This url is not on the database.'});
});


app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));    
});