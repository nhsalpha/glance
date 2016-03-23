var express = require('express');
var app = express();

app.use(express.static('public'));
app.set('view engine', 'jade');

app.get('/', function (req, res) {
  res.render('index', { title: 'Glance test' });
});

app.get('/test', function (req, res) {
  res.render('test', { title: 'Glance test' });
});

app.listen(3000, function () {
  console.log('Listening on port 3000');
});
