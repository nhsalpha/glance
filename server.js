var express = require('express');
var app = express();

var json2csv = require('json2csv');
var fs = require('fs');

var csvFields = ['correct', 'duration', 'real', 'response', 'responseTime', 'state', 'word'];

function leadingZero(number) {
  if (number.toString().length === 1) {
    number = '0' + number;
  }
  return number;
}

app.use(express.static('public'));
app.set('view engine', 'jade');

app.get('/', function (req, res) {
  res.render('index', { title: 'Glance test' });
});

app.get('/test', function (req, res) {
  res.render('test', { title: 'Glance test' });
});

app.get('/end-experiment', function (req, res) {

  var experiment = JSON.parse(req.query.data);
  var timestamp = new Date();
  var fileName = timestamp.getFullYear() + '-'
                + leadingZero(timestamp.getMonth()+1) + '-'
                + leadingZero(timestamp.getDate()) + '-'
                + leadingZero(timestamp.getHours())
                + leadingZero(timestamp.getMinutes())
                + leadingZero(timestamp.getSeconds())
                + '-results.csv';

  json2csv({ data: experiment, fields: csvFields }, function(err, csv) {
    if (err) console.log(err);
    fs.writeFile('saved-data/' + fileName, csv, function(err) {
      if (err) throw err;
      console.log('file saved');
    });
  });
  res.send('finished');
});

app.listen(3000, function () {
  console.log('Listening on port 3000');
});
