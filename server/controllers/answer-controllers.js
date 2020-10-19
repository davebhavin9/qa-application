const db = require("../models");
const uuid= require('uuid');
const QModel = db.questions;
const User = db.users;

const Category = db.categories;
const Answer = db.answers;
const { check, validationResult } = require('express-validator');
const path = require("path");
const base64 = require('base-64');
const { Console } = require("console");
const CService = require(path.resolve(".") + "/server/services/CServices.js");




exports.create = async (req, res) => {
    var responseObj =  {}
    let decodedData = {};
    if(req.body.user_id || req.body.updated_timestamp || req.body.created_timestamp)
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

   var result= decodedData.data.split(':');
    console.log(result[0]);


    var user = await User.findOne({ where: { username: result[0]}})
    if(user==null) return res.status(401).send({Error: "User does not exist "})
    try{var question = await QModel.findByPk(req.params.question_id);}
    catch(e){ return res.status(404).send({Error: "Question does not exist."})}


   try{ var answer = await Answer.create({
        answer_text: req.body.answer_text,
        answer_id: uuid.v4()
    })}
    catch(e){ return res.status(500).send({Error: "error please check the inputs again"})}

    await question.addAnswer(answer)
    try{await user.addAnswer(answer)}
    catch(e){return res.status(401).send({Error: "check again"})}
    answer = await Answer.findOne({ where : {answer_id: answer.answer_id}});

    return res.status(201).send(answer)
}

exports.deleteAnswer = async (req, res) => {
    var responseObj =  {}
    let decodedData = {};
    if( req.body.user_id || req.body.updated_timestamp || req.body.created_timestamp)
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

    var result= decodedData.data.split(':');
    console.log(result[0]);

    const user = await User.findOne({ where: { username: result[0]}})

    try{var question = await QModel.findByPk(req.params.question_id)}
    catch(e){ return res.status(404).send({Error: "Question does not exist"})}

    let answer = await question.getAnswers({ where: {answer_id: req.params.answer_id}});
    if(answer.length === 0) return res.status(404).send({Error: "Answer does not exist for this particular question"})

    answer = answer[0];

    if(answer.user_id !== user.id) return res.status(401).send({Error: "User is not authorised for this request"})
    await user.removeAnswer(answer)

    await question.removeAnswer(answer)

    await Answer.destroy({where: { answer_id: req.params.answer_id}})

    return res.status(204).send()

}

exports.updateAnswer = async (req,res) => {
    var responseObj =  {}
    let decodedData = {};
    if( req.body.user_id || req.body.updated_timestamp || req.body.created_timestamp)
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

   var result= decodedData.data.split(':');
    console.log(result[0]);


   try{var user = await User.findOne({ where: { username: result[0]}})}
   catch(e){return res.status(404).send({Error: "USer does not exist"})}
    if(user==null || user==undefined)res.status(404).send({Error: "USer does not exist"})
    try{var question = await QModel.findByPk(req.params.question_id)}
    catch(e){ return res.status(404).send({Error: "Question does not exist"})}
    console.log("answer_id "+req.params.answer_id)
    let answer = await question.getAnswers({ where: {answer_id: req.params.answer_id}});
    console.log("ans "+answer.user_id)
    console.log("id "+user.id)
    
    if(answer.length === 0) return res.status(404).send({Error: "Answer not found for this question for this particualar user/please check the credentials"})
    answer = answer[0];
    if(answer.user_id !== user.id) return res.status(401).send({Error: "User unauthorised"})
    
    
    await Answer.update(
        { answer_text: req.body.answer_text },
        {
            where: { answer_id: req.params.answer_id}
        })

    return res.status(204).send();
}


exports.getAnswer = async (req,res) => {
    try{var question = await QModel.findByPk(req.params.question_id);}
    catch(e){ return res.status(404).send({Error: "Question does not exits"})}

    const answer = await question.getAnswers( { where: {answer_id: req.params.answer_id}})
    if(answer.length === 0) return res.status(404).send({Error: "Ans for this question does not exist"})

    return res.status(200).send(answer)

}