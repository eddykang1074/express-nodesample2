//회원정보관리 전용 RESTful 라우터 파일-memberAPI.js
//memberAPI.js라우터파일의 기본 주소는 http://localhost:3000/api/member

var express = require('express');
var router = express.Router();

//단뱡향 암호화 패키지 참조
var bcrypt = require('bcryptjs');

//JSON WEB TOKEN 패키지 참조하기 
const jwt = require('jsonwebtoken');

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

            //STEP3: jsonwebtoken 패키지를 이용해 로그인한 사용자정보를 JWT토큰으로 생성하고
            //토큰값을 apiResult.data =토큰값을 전달한다. 

            //JWT 토큰안에 담을 실제 로그인 사용자 주요 JSON데이터
            var memberTokenData = {
                member_id:member.member_id,
                email:member.email,
                name:member.name,
                profile_img_path:member.profile_img_path,
                telephone:member.telephone
            };

            //로그인 사용자 주요정보를 JWT토큰으로 생성한다.
            //jwt.sign("토큰안에 담을 실제json데이터","토큰생성인증키값",생성옵션(토큰유지시간설정-파기시간,만든이정보));
            const token = jwt.sign(memberTokenData,process.env.JWT_SECRET,{
                expiresIn:"6h", //10s,60m,24h
                issuer:"msoftware"
            });

            apiResult.code = 200;
            apiResult.data = token;
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


//현재 로그인 사용자 정보를 JWT토큰값을 기반으로 조회하여 반환하는 라우팅메소드
//http://localhost:3000/api/member/profile
router.get('/profile',async(req,res)=>{

    //api호출 기본 결과 데이터 구조정의 
    var apiResult = {
        code:200,
        data:null,
        result:""
    };

    try{
        //STEP1) HTTP Header를 통해 전달된 jwt 토큰값을 추출한다. 
        const  token = req.headers.authorization.split('Bearer ')[1];

        console.log("클라이언트에서 전달된 현재 로그인한 사용자의 jwt토큰값:",token);

        //STEP2) 로그인한 사용자의 JWT토큰내에 로그인 사용자 JSON데이터를 추출한다.
        //jwt.verify('토큰값','토큰발급시 사용한 인증키값');
        var loginUserData = jwt.verify(token,process.env.JWT_SECRET);

        //STEP3)JWT토큰내 사용자 메일주소를 이용해 DB에서 사용자 전체 정보를 조회해 반환한다.
        var profileData = await db.Member.findOne({where:{member_id:loginUserData.member_id}});
        
        profileData.member_password = "";

        apiResult.code = 200;
        apiResult.data = profileData;
        apiResult.result="Ok";

    }catch(Err){
        apiResult.code = 500;
        apiResult.data = null;
        apiResult.result="Failed";
    }

    res.json(apiResult);
});








//라우터 객체를 반드시 외부로 노출한다.
module.exports = router;