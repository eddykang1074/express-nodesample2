var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//dotenv 어플리케이션 환경설정관리 패키지 참조 및 구성하기
//프로젝트 루트에 생성한 .env 환경설정파일내 저장된 키값들을 어플리케이션 메모리에 저장한다.
require('dotenv').config();

//CORS 지원위해 패키지참조 
const cors = require("cors");

var sequelize = require('./models/index.js').sequelize;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

//개발자 정의 회원정보관리 RESTful 라우터파일 참조하기 
var memberAPIRouter = require('./routes/memberAPI.js');


var app = express();

//mysql과 자동연결처리 및 모델기반 물리 테이블 생성처리제공
sequelize.sync(); 

//모든 호출방식(모바일앱,이기종시스템,다른웹사이트)-주소 허락
app.use(cors());


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

//memberAPIRouter의 기본 호출주소 체계를 정의합니다
//http://localhost:3000/api/member
app.use('/api/member',memberAPIRouter);


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
  res.render('error');
});

module.exports = app;
