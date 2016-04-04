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
  res.render('index');
});

app.get('/test', function (req, res) {
  res.render('test');
});

app.get('/complete', function (req, res) {

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
    if (err) {
      console.log(err);
      res.render('complete', { success: false, message: 'json2csv formatting fail' });
    }
    fs.writeFile('saved-data/' + fileName, csv, function(err) {
      if (err) {
        console.log(err);
        res.render('complete', { success: false, message: 'csv file not saved' });
      }
      console.log('file saved');
    });
  });
  res.render('complete', { success: true, message: 'success' });
});

app.listen(3000, function () {
  console.log('Listening on port 3000');
});
