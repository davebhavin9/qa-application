const express = require("express");
const bcrypt = require('bcryptjs');
const router = express.Router();
const Sequelize = require('sequelize');
const base64 = require('base-64');
//const { v4: uuidv4 } = require('uuid');

const uuid = require('uuid');
const path = require("path");
//const app = express();
const { check, validationResult } = require('express-validator');
var passwordValidator = require('password-validator');
const QService = require(path.resolve(".") + "/server/services/QServices.js");
const CService = require(path.resolve(".") + "/server/services/CServices.js");


router.post("/v1/question", [

check('question_text').isString().exists(),

],async function (req, res) {
    const responseObj = {}
    let decodedData = {};
    let responseObj1 = {};
    if(req.body.question_id || req.body.user_id || req.body.updated_timestamp || req.body.created_timestamp)
    {
        return res.status(400).json("PLease recheck the inputs")
    }
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const bHeader = req.headers.authorization;
    if (typeof bHeader != "undefined") {
        const bearer = bHeader.split(' ');
        const bToken = bearer[1];
        decodedData.data = base64.decode(bToken);
    }
    else {
        res.statusCode = 401;
        responseObj.result = "unauthorised token";
        return res.send(responseObj);
    }
    if(req.body.categories)
    var temp=req.body.categories;
    console.log("this is your table"+req.body.categories[0].category);
    {
        CService.createCategory(decodedData, temp, function (error, result) {
            if (error) {
                res.statusCode = 400;
                res.statusMessage = "Bad Request";
                responseObj.error = error;
                res.send(responseObj);
            }
            else {
                res.statusCode = 201;
                res.statusMessage = "OK";
                responseObj1.result = result;
                responseObj.temp = result;
                res.send(responseObj1);
                if(req.body.categories)
                delete req.body.categories;
                QService.createQuestion(decodedData, req.body, function (error, result) {
                    if (error) {
                        res.statusCode = 400;
                        res.statusMessage = "Bad Request";
                        responseObj.error = error;
                        res.send(responseObj);
                    }
                    else {
                        res.statusCode = 201;
                        res.statusMessage = "OK";
                        responseObj.temp = result;
                        responseObj.temp.categories=responseObj1.result
                        res.send(responseObj);
                    }
                })
            }
        })
    }
    
})

router.get("/v1/user/:id", function (req, res) {
    let responseObj = {};
    console.log(req.params) ;
    var temp = req.params
    CService.getUserbyID( temp, function (error, result) {
        
    if (error) {
        if (error == "user unauthorized to access this data") {
            res.statusCode = 401
            res.statusMessage = "Unauthorised"
            responseObj.error = error
            res.send(responseObj);
        }
        else if (error == "data not found") {
            res.statusCode = 200
            res.statusMessage = "NOT FOUND"
            responseObj.error = error
            res.send(responseObj);
        }
        else {
            res.statusCode =400
            res.statusMessage = "BAD REQUEST"
            responseObj.error = error
            res.send(responseObj);
        }
    }
    else {
        res.statusCode = 200
        res.statusMessage = "OK"
        responseObj.result = result;
        res.send(responseObj);
    }
})

})

module.exports = router;
