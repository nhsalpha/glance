var express = require('express');
var app = express();

var json2csv = require('json2csv');
var fs = require('fs');
var fields = ['correct', 'duration', 'real', 'response', 'responseTime', 'state', 'word'];

app.use(express.static('public'));
app.set('view engine', 'jade');

app.get('/', function (req, res) {
  res.render('index', { title: 'Glance test' });
});

app.get('/test', function (req, res) {
  res.render('test', { title: 'Glance test' });
});

app.get('/end-experiment', function (req, res) {
  console.log(req.query.data);
  var experiment = JSON.parse(req.query.data);
  console.log(typeof experiment);
  json2csv({ data: experiment, fields: fields }, function(err, csv) {
    if (err) console.log(err);
    fs.writeFile('saved-data/file.csv', csv, function(err) {
      if (err) throw err;
      console.log('file saved');
    });
  });
  res.send('finished');
});

app.listen(3000, function () {
  console.log('Listening on port 3000');
});
