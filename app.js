var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var bodyParser = require('body-parser')
var cors = require('cors')

/*
var {app,BrowserWindow} = require('electron')

var window = {}
window.createWindows=()=> {
  let win = new BrowserWindow({
    width:1366,
    height:768,
    webPreferences:{
      nodeIntegration:true
    }
  })
  win.loadFile('public/index.html')
  win.webContents.openDevTools()
}
app.on('ready',window.createWindows)
*/

var app = express();
app.use(cors())
app.use(bodyParser.json({limit:'1gb'}))
// view engine setup

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'public')));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json('error');
});
module.exports = app;