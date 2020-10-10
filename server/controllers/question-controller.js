const db = require("../models");
const uuid= require('uuid');
const QModel = db.questions;
const User = db.users;

const Category = db.categories;
const Answer = db.answers;
const { check, validationResult } = require('express-validator');
const joi = require('joi');
const path = require("path");
const base64 = require('base-64');
const { Console } = require("console");
const CService = require(path.resolve(".") + "/server/services/CServices.js");


exports.getUserById = async (req, res) =>  {
    let responseObj = {};
    console.log(req.params) ;
    var temp = req.params
    CService.getUserbyID( temp, function (error, result) {
        
    if (error) {
        if (error == "user unauthorized to access this data") {
            res.statusCode = 401
            res.statusMessage = "Unauthorised"
            responseObj.error = error
          return  res.send(responseObj);
        }
        else if (error == "data not found") {
            res.statusCode = 200
            res.statusMessage = "NOT FOUND"
            responseObj.error = error
         return   res.send(responseObj);
        }
        else {
            res.statusCode =400
            res.statusMessage = "BAD REQUEST"
            responseObj.error = error
        return    res.send(responseObj);
        }
    }
    else {
        res.statusCode = 200
        res.statusMessage = "OK"
        responseObj.result = result;
        res.send(responseObj);
    }
})

}

exports.create = async (req, res) => {
   

    var responseObj =  {}
    let decodedData = {};
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

   var result= decodedData.data.split(':');
    console.log(result[0]);
    console.log("ques"+req.body.question_text)
        let user = await User.findOne({where: {username: result[0]}});
        console.log(user)
        let question = {
            question_id: uuid.v4(),
            question_text: req.body.question_text,
        }
       try{ var questionCreated = await QModel.create(question)}
       catch(e) {return res.status(500).send({Error: "Question already posted "})}
      

        console.log(question)
        await user.addQuestion(questionCreated)
        console.log("user"+user)
        if(req.body.categories){
            let i = 0
            for(;i<req.body.categories.length;i++){
                let questionCategory = req.body.categories[i]
                let [categoryToAdd, created] = await Category.findOrCreate({where: {category: questionCategory.category.toLowerCase()},
                    defaults: {
                        category_id: uuid.v4()
                    }
                })
                await questionCreated.addCategory(categoryToAdd)
            }
        }

        const result1 = await QModel.findByPk(questionCreated.question_id,{
            include: [
                {
                    model: Category,
                    through: { attributes: [] }
                },
                {
                    as: 'answers',
                    model: Answer
                }]
        })

        return res.status(201).send(result1);
}



async function checkUser(username, user_id){
    const user = await User.findOne({where: {username: username}});
    if(user.id === user_id)
        return true;

    return false;

}

exports.deleteQuestion = async (req,res) => {
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
    if (typeof bHeader == "undefined") {
        res.statusCode = 401;
        responseObj.result = "unauthorised token";
        return res.send(responseObj);
    }
    else{
        const bearer = bHeader.split(' ');
        const bToken = bearer[1];
        decodedData.data = base64.decode(bToken);
    }
    var result= decodedData.data.split(':');
    console.log(result[0]);
    console.log("ques"+req.body.question_text)

    try{ var question = await QModel.findByPk(req.params.question_id)}
    catch(e){ return res.status(404).send({Error: "Question does not exists"})}

    try{var user = await checkUser(result[0], question.user_id)}

    catch(e){ return res.status(401).send({Error: "User unauthorized"})}

    user = await User.findOne({where: {username: result[0]}});
    let answers = await question.getAnswers();
    console.log(answers.length);
    if(answers.length === 0){
        try{var result = await QModel.destroy({ where: {question_id: question.question_id}})}
       catch(e){ return res.status(500).send({Error: ' error'})}
        return res.status(204).send();
    }
    return res.status(400).send({Error: "The question has more than 1 answers."})

}

exports.updateQuestion = async (req, res) => {
    var responseObj =  {}
    let decodedData = {};
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

   var result= decodedData.data.split(':');
    console.log(result[0]);
    console.log("ques"+req.body.question_text)

    try{var question = await QModel.findByPk(req.params.question_id)}
  catch(e){ return res.status(404).send({Error: "Question not found"})}

    let user = await User.findOne({where: {username: result[0]}});
    if(user==null || user==undefined)return res.status(401).send({Error: "User unauthorized"})
    if(user.id !== question.user_id) return res.status(401).send({Error: "User unauthorized"})

    const arraySchema = joi.array().items(
        joi.object({
            category: joi.string()
        })
    );
    const schema = joi.object().keys({
        question_text: joi.string(),
        categories: arraySchema
    });

    const { question_text, categories } = req.body;

    if(!question_text && !categories) return res.status(400).send({Error: "No field supplied to update"})

    try{let validation = schema.validate(req.body);}
    catch(e){ return res.status(400).send({Error: validation.error.details[0].message});}

    let updatedQuestion = {}

    if(question_text){
        updatedQuestion.question_text = question_text
    }

    await QModel.update(updatedQuestion, { where: { question_id: req.params.question_id}})

    let questionUpdated = await QModel.findByPk(req.params.question_id)

    if(categories){
        await questionUpdated.setCategories([]);
        let i = 0
        for(;i<categories.length;i++){
            let questionCategory = categories[i]
            let [categoryToAdd, created] = await Category.findOrCreate({where: {category: questionCategory.category.toLowerCase()},
                defaults: {
                    category_id: uuid.v4()
                }
            })

            await questionUpdated.addCategory(categoryToAdd)
        }

    }
    res.status(204).send({});

}
exports.getAllQuestions = async (req,res) => {
    const result = await QModel.findAll({
        include: [
            {
                model: Category,
                through: { attributes: [] }
            },
            {
                as: 'answers',
                model: Answer
            }
        ]
    })

    res.status(200).send(result)
}
exports.getQuestion = async (req,res) => {
   try{ var result = await QModel.findByPk(req.params.question_id,{
        include: [
            {
                model: Category,
                through: { attributes: [] }
            },
            {
                as: 'answers',
                model: Answer
            }]
    })}

   catch(e){ return res.status(404).send({Error: "Question does not exist"})}

    res.status(200).send(result);
}