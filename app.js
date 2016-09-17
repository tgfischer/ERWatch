var express = require('express');
var ejs = require('ejs');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Create a new express server
var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 3000);

// Serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

/* Set up the routes
------------------------------------------------------ */
var index = require('./routes/index');
app.use('/', index);

/* 404 Page
-------------------------------------------------------- */
app.use(function(req, res, next) {
  res.status(404);
  var message = 'It looks like we cannot find the page you are looking for :('

  // respond with html page
  if (req.accepts('html')) {
    res.render('error', {
      message : message
    });

    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({
      error: message
    });

    return;
  }

  // default to plain-text. send()
  res.type('txt').send(message);
});

/* Start the server
------------------------------------------------------ */
app.listen(app.get('port'), function() {
  console.log("server starting on " + app.get('port'));
});
