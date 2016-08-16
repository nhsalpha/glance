var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var json2csv = require('json2csv');
var fs = require('fs');

app.use(bodyParser.json());

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

app.get('/qualifier', function (req, res) {
  res.render('qualifier');
});

app.get('/experiment-intro', function (req, res) {
  res.render('experiment-intro');
});

app.get('/experiment', function (req, res) {
  res.render('experiment');
});

app.get('/complete', function (req, res) {
  res.render('complete');
});

app.get('/error', function (req, res) {
  res.render('error');
});

app.post('/save-results', function(req, res) {
  var experiment = req.body;
  var timestamp = new Date();
  var fileName = timestamp.getFullYear() + '-'
                + leadingZero(timestamp.getMonth()+1) + '-'
                + leadingZero(timestamp.getDate()) + '-'
                + leadingZero(timestamp.getHours())
                + leadingZero(timestamp.getMinutes())
                + leadingZero(timestamp.getSeconds())
                + '-results.csv';

  json2csv({ data: experiment }, function(err, csv) {
    if (err) {
      console.log(err);
      res.json({ success: false, message: 'json2csv: ' + err });
    }
    fs.writeFile('saved-data/' + fileName, csv, function(err) {
      if (err) {
        console.log(err);
        res.json({ success: false, message: 'writeFile: ' + err });
      }
      console.log('file saved');
    });
  });
  res.json({ success: true });
});

app.listen(3000, function () {
  console.log('Listening on port 3000');
});
