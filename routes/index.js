//express 패키지를 참조한다.
var express = require('express');

//라우터(사용자요청과응답처리 객체)객체를 생성합니다.
var router = express.Router();



/* 메인 웹페이지 요청과 응답 처리 라우팅 메소드  */
router.get('/', function(req, res, next) {
  res.render('index', { title: '강창훈1' });
});

//회사소개 웹페이지에 대한 요청과 응답처리 라우팅메소드
//router.get('호출주소',호출처리응답콜백함수);
//http://localhost:3000/contact
router.get('/contact',function(req,res){

  //req는 HttpRequest객체로 웹브라우저에서 전달되는 각종 정보를 추출하는데 사용하는 객체 
  //res는 HttpResponse 객체로 (웹,WAS)서버에서 웹브라우저로 전달하는 정보를 추출/제어하는 객체 
  
  //res.render('뷰파일경로지정','지정된 뷰파일에 전달할 JSON데이터');
  //res.render('contact.ejs',{ceo:"강창훈",company:"엠소프트웨어",telephone:"010-2760-5246"});

  //res.json('클라이언트에게 전달할 순수 json데이터');
  res.json({ceo:"강창훈",company:"엠소프트웨어",telephone:"010-2760-5246"});

  //res.send();
  //res.redirect();

});


module.exports = router;
