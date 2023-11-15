//회원정보관리 전용 RESTful 라우터 파일-memberAPI.js
//memberAPI.js라우터파일의 기본 주소는 http://localhost:3000/api/member

var express = require('express');
var router = express.Router();

//단뱡향 암호화 패키지 참조
var bcrypt = require('bcryptjs');

//ORM DB객체를 참조합니다.
var db = require('../models/index.js');

//신규회원가입 데이터처리 요청과 응답처리 라우팅메소드
//http://localhost:3000/api/member/entry
router.post('/entry',async(req,res)=>{

    //api호출 기본 결과 데이터 구조정의 
    var apiResult = {
        code:200,
        data:null,
        result:""
    };

    try{
        //STEP1: 클라이언트에서 전달하는 신규 회원정보 추출하기 
        var email = req.body.email;
        var password = req.body.password;
        var name = req.body.name;
        var telephone = req.body.telephone;


        //사용자 암호를 단방향 암호(해시알고리즘) 적용하기
        var encryptedPassword = await bcrypt.hash(password,12);

        //STEP2: DB member 테이블에 저장할 데이터 구조 정의 및 데이터 바인딩하기
        //DB에 저장할 member객체의 속성은 Models/member.js모델의 속성과동일해야함.
        var member = {
            email,
            member_password:encryptedPassword,
            name,
            telephone,
            entry_type_code:1,
            use_state_code:1,
            reg_date:Date.now(),
            reg_member_id:1
        }


        //STEP3: ORM을 통해 MEMBER테이블에 데이터를 등록하고 등록된 회원정보를 반환받는다.
        //Member.create();=>Insert Into member(email)Values(emai.);
        var registedMember = await db.Member.create(member);


        //STEP4:반환된 DB에 저장된 회원정보를 클라이언트(웹브라우저)에 결과값으로 반환한다.
        apiResult.code =200;
        apiResult.data =registedMember;
        apiResult.result ="Ok";

    }catch(Err){
        console.log("서버 라우팅메소드 에러발생-/entry:",Err.message);

        apiResult.code =500;
        apiResult.data =null;
        apiResult.result ="Failed";
    }

    

    //API호출결과 반환하기
    res.json(apiResult);
});


//회원 로그인 요청과 응답처리 라우팅 메소드 
//http://localhost:3000/api/member/login
router.post('/login',async(req,res)=>{
    //api호출 기본 결과 데이터 구조정의 
    var apiResult = {
        code:200,
        data:null,
        result:""
    };


    //STEP1: 프론트엔드에서 사용자 메일주소와 암호를 추출한다.
    var email = req.body.email;
    var password = req.body.password;

    //STEP2: 동일한 메일주소 사용자를 조회한다.
    var member = await db.Member.findOne({where:{email:email}});

    if(member == null){
        //동일한 메일주소가 존재하지 않은경우 
        apiResult.code =400;
        apiResult.data =null;
        apiResult.result ="동일한 메일주소가 존재하지 않습니다.";
    }else{

        //동일한 메일주소가 존재하는 경우 암호체크
        //bcrypt.compare()메소드는 사용자입력 암호값과 db상에 암호화된 값을 비교해서
        //동일하면 true를 다르면 false를 반환하다.
        const result = await bcrypt.compare(password,member.member_password);

        if(result == true){
            //암호가 일치하는 경우 

            //STEP3: jsonwebtoken패키지를 이용해 로그인한 사용자정보를 JWT토큰으로 생성하고
            //토큰값을 apiResult.data =토큰값을 전달한다. 


            apiResult.code =200;
            apiResult.data =member;
            apiResult.result ="Ok";
        }else{
            //암호가 일치하지 않은경우 
            apiResult.code =401;
            apiResult.data =null;
            apiResult.result ="암호가 일치하지 않습니다.";
        }
    }


    //API호출결과 반환하기
    res.json(apiResult);
});


//라우터 객체를 반드시 외부로 노출한다.
module.exports = router;