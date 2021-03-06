var express = require('express');
var router = express.Router();//{mergeParams: true}
const authUtil = require('../module/authUtil');
const responseMessage = require('../module/responseMessage');
const statusCode = require('../module/statusCode');
const myPlace = require('../model/myPlaceModel');
const authMiddleware = require('../module/authMiddleware');


router.post('/addLocation', authMiddleware.validToken, async(req, res) => { //집 or 직장 주소 추가
    const {category, address, X, Y} = req.body;
    // 파라미터 오류
    if(!category || !address || !X || !Y) {
        const missParameters = Object.entries({category, address, X, Y})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res.status(statusCode.BAD_REQUEST)
        .send(authUtil.successFalse(statusCode.BAD_REQUEST,`${missParameters} ${responseMessage.NULL_VALUE}`));
        return;
    }
    // Token 통해서 userIdx 취득
    const userIdx = req.decoded.userIdx;//클라는 로그인 시 받은 token값을 넘겨줄 것임
    if(!userIdx)
    {
        res.status(statusCode.BAD_REQUEST)
        .send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.EMPTY_TOKEN));
        return;
    }

    //원래 주소 등록했는지 조회
    let getPlace = await myPlace.checkLocation(category,userIdx);
    if(getPlace == undefined){
        console.log("처음등록");
        myPlace.addLocation(category, address, X, Y, userIdx)
        .then(({code, json}) => {
            res.status(code).send(json);
        }).catch(err => {
            console.log("주소 등록 실패");
            res.status(statusCode.INTERNAL_SERVER_ERROR)
            .send(authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        });
    }
    else{
        console.log("업데이트");
        myPlace.updateLocation(category, address, X, Y, userIdx)
        .then(({code, json}) => {
            res.status(code).send(json);
        }).catch(err => {
            console.log("주소 등록 실패");
            res.status(statusCode.INTERNAL_SERVER_ERROR)
            .send(authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        });
    }
});


router.get('/getLocation', authMiddleware.validToken2, async(req, res) => { //집 or 직장 주소 가져오기
    const category = req.query.category;
    console.log(category);

    // Token 통해서 userIdx 취득
    const userIdx = req.decoded.userIdx;//클라는 로그인 시 받은 token값을 넘겨줄 것임
    if(!userIdx)
    {
        res.status(statusCode.BAD_REQUEST)
        .send(authUtil.successFail(statusCode.BAD_REQUEST, responseMessage.EMPTY_TOKEN));
        return;
    }

    myPlace.getLocation(category, userIdx)
    .then(({code, json}) => {
        res.status(code).send(json);
    }).catch(err => {
        console.log("주소 조회 실패");
        res.status(statusCode.INTERNAL_SERVER_ERROR)
        .send(authUtil.successFail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});








router.post('/addFavoritePath', authMiddleware.validToken, async(req, res) => { //집 or 직장 주소 추가
    const {startAddress, SX, SY, endAddress, EX, EY} = req.body;
    // 파라미터 오류
    if(!startAddress || !SX || !SY || !endAddress || !EX || !EY) {
        const missParameters = Object.entries({startAddress, SX, SY, endAddress, EX, EY})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res.status(statusCode.BAD_REQUEST)
        .send(authUtil.successFalse(statusCode.BAD_REQUEST,`${missParameters} ${responseMessage.NULL_VALUE}`));
        return;
    }

    
    // Token 통해서 userIdx 취득
    const userIdx = req.decoded.userIdx;//클라는 로그인 시 받은 token값을 넘겨줄 것임
    if(!userIdx)
    {
        res.status(statusCode.BAD_REQUEST)
        .send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.EMPTY_TOKEN));
        return;
    }

    //원래 주소 등록했는지 조회
    let getFavorite = await myPlace.getFavoritePath(startAddress, endAddress, userIdx);
    console.log(getFavorite);
    if(getFavorite.length != 0){
        console.log("처음등록");
        myPlace.addFavoritePath(startAddress, SX, SY, endAddress, EX, EY, userIdx)
        .then(({code, json}) => {
            res.status(code).send(json);
        }).catch(err => {
            console.log("즐겨찾는 경로 등록 실패");
            res.status(statusCode.INTERNAL_SERVER_ERROR)
            .send(authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        });
    }
    else{
        console.log("이미 존재");
        res.status(statusCode.OK)
            .send(authUtil.successFalse(statusCode.OK, responseMessage.ADD_FAVORITE_PATH_SUCCESS));
    }
});


router.get('/getFavoritePath', authMiddleware.validToken2, async(req, res) => { //집 or 직장 주소 가져오기
    // Token 통해서 userIdx 취득
    const userIdx = req.decoded.userIdx;//클라는 로그인 시 받은 token값을 넘겨줄 것임
    if(!userIdx)
    {
        res.status(statusCode.BAD_REQUEST)
        .send(authUtil.successFail(statusCode.BAD_REQUEST, responseMessage.EMPTY_TOKEN));
        return;
    }

    myPlace.getFavoritePath(null, null, userIdx)
    .then(({code, json}) => {
        res.status(code).send(json);
    }).catch(err => {
        console.log("주소 조회 실패");
        res.status(statusCode.INTERNAL_SERVER_ERROR)
        .send(authUtil.successFail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

module.exports = router;