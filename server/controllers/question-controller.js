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

var fileName= "question-controller.js";
const logger = require('../logger/logger')
const SDC = require('node-statsd'), sdc = new SDC();

const File = db.file;
const aws = require('aws-sdk');
const s3 = new aws.S3(
    {
        accessKeyId: process.env.access,
        secretAccessKey: process.env.secret,
        Bucket: "webapp.dave.bhavin"
      }
);
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config();


exports.getUserById = async (req, res) =>  {
    sdc.increment('GET userByID');
    let StartTime4 = new Date();
    let responseObj = {};
    console.log(req.params) ;
    var temp = req.params
    CService.getUserbyID( temp, function (error, result) {
        
    if (error) {
        if (error == "user unauthorized to access this data") {
            res.statusCode = 401
            logger.error("Unautherized in file question"+fileName);
            res.statusMessage = "Unauthorised"
            responseObj.error = error
          return  res.send(responseObj);
        }
        else if (error == "data not found") {
            res.statusCode = 200
            logger.error("Not found in question"+fileName);
            res.statusMessage = "NOT FOUND"
            responseObj.error = error
         return   res.send(responseObj);
        }
        else {
            res.statusCode =400
            logger.error("bad request in question"+fileName);
            res.statusMessage = "BAD REQUEST"
            responseObj.error = error
        return    res.send(responseObj);
        }
    }
    else {
        let endTime4 = new Date();
        let totalTime4= StartTime4.getMilliseconds()-endTime4.getMilliseconds();
         logger.info("Get user  ", totalTime4);
         logger.info("GET req " + fileName) 
         sdc.timing('GET user by ID', totalTime4)
        res.statusCode = 200
        res.statusMessage = "OK"
        responseObj.result = result;
        res.send(responseObj);
    }
})

}

exports.create = async (req, res) => {
    sdc.increment('POST question');
    let StartTime5 = new Date();

    var responseObj =  {}
    let decodedData = {};
    if(req.body.question_id || req.body.user_id || req.body.updated_timestamp || req.body.created_timestamp)
    {
        return res.status(400).json("PLease recheck the inputs")
    }
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        logger.error("bad request"+fileName);
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
        logger.error("unauthorised token"+fileName);
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
       catch(e) {logger.error("question already posted"+fileName); return res.status(500).send({Error: "Question already posted "})}
      

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
                },
                {
                    as: 'attachments',
                    model: File,
                    attributes: ['file_name','s3_object_name','file_id','created_date', 'LastModified', 'ContentLength', 'ETag']
                }]
        })
        let endTime5 = new Date();
        let totalTime5= StartTime5.getMilliseconds()-endTime5.getMilliseconds();
         logger.info("POST question  ", totalTime5);
         logger.info("POST question " + fileName) 
         sdc.timing('POST Question', totalTime5)
        return res.status(201).send(result1);
}



async function checkUser(username, user_id){
    const user = await User.findOne({where: {username: username}});
    if(user.id === user_id)
        return true;
    return false;

}

exports.deleteQuestion = async (req,res) => {
    sdc.increment('DELETE question');
    let StartTime6 = new Date();
    var responseObj =  {}
    let decodedData = {};
    if( req.body.user_id || req.body.updated_timestamp || req.body.created_timestamp)
    {
        logger.error("inputs wrong"+fileName);
        return res.status(400).json("PLease recheck the inputs")
    }
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        logger.error("bad request"+fileName);
        return res.status(400).json({ errors: errors.array() })
    }
    const bHeader = req.headers.authorization;
    if (typeof bHeader == "undefined") {
        res.statusCode = 401;
        logger.error("Unautherized Tocken"+fileName);
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
    catch(e){logger.error("question does not exist"+fileName); return res.status(404).send({Error: "Question does not exists"})}

    try{var user = await checkUser(result[0], question.user_id)}

    catch(e){logger.error("User unauthorised"+fileName); return res.status(401).send({Error: "User unauthorized"})}

    user = await User.findOne({where: {username: result[0]}});
    let answers = await question.getAnswers();
    console.log(answers.length);
    if(answers.length === 0){
        let files = await question.getAttachments();

        for(let i=0;i<files.length;i++){
            await File.destroy({where: {file_id: files[i].file_id}})

            let params = {
                Bucket: "webapp.dave.bhavin",
                Key: files[i].s3_object_name
            }
            s3.deleteObject(params, function(err, data) {
                if (err) console.log(err, err.stack);
                else    return; 
            });
        }
        try{var result = await QModel.destroy({ where: {question_id: question.question_id}})}
       catch(e){ logger.error("error 500"+fileName); return res.status(500).send({Error: ' error'})}
       let endTime6 = new Date();
       let totalTime6= StartTime6.getMilliseconds()-endTime6.getMilliseconds();
        logger.info("DELETE question  ", totalTime6);
        logger.info("DELETE question " + fileName) 
        sdc.timing('DELETE Question', totalTime6)
        return res.status(204).send();
    }
    logger.error("THe question has more than 1 answer"+fileName);
    return res.status(400).send({Error: "The question has more than 1 answers."})

}

exports.updateQuestion = async (req, res) => {
    sdc.increment('UPDATE question');
    let StartTime7 = new Date();
    var responseObj =  {}
    let decodedData = {};
    if(req.body.question_id || req.body.user_id || req.body.updated_timestamp || req.body.created_timestamp)
    {
        logger.error("Recheck inputs for question"+fileName);
        return res.status(400).json("PLease recheck the inputs")
    }
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        logger.error("bad request for question"+fileName);
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
        logger.error("Unautherized Tocken for question"+fileName);
        responseObj.result = "unauthorised token";
        return res.send(responseObj);
    }

   var result= decodedData.data.split(':');
    console.log(result[0]);
    console.log("ques"+req.body.question_text)

    try{var question = await QModel.findByPk(req.params.question_id)}
  catch(e){logger.error("question not found for question"+fileName); return res.status(404).send({Error: "Question not found"})}

    let user = await User.findOne({where: {username: result[0]}});
    if(user==null || user==undefined){logger.error("Unautherized user for question"+fileName);return res.status(401).send({Error: "User unauthorized"})}
    if(user.id !== question.user_id){logger.error("Unautherized user for question"+fileName); return res.status(401).send({Error: "User unauthorized"})}

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

    if(!question_text && !categories){logger.error("No field supplied dor question"+fileName); return res.status(400).send({Error: "No field supplied to update"})}

    try{var validation = schema.validate(req.body);}
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
    let endTime7 = new Date();
    let totalTime7= StartTime7.getMilliseconds()-endTime7.getMilliseconds();
     logger.info("PUT question  ", totalTime7);
     logger.info("PUT question " + fileName) 
     sdc.timing('PUT Question', totalTime7)
    res.status(204).send({});

}
exports.getAllQuestions = async (req,res) => {
    sdc.increment('GET ALL question');
    let StartTime8 = new Date();
    const result = await QModel.findAll({
        include: [
            {
                model: Category,
                through: { attributes: [] }
            },
            {
                as: 'answers',
                model: Answer,
                include : {
                    as: 'attachments',
                    model: File,
                    attributes: ['file_name','s3_object_name','file_id','created_date', 'LastModified', 'ContentLength', 'ETag']
                }
            },
            {
                as: 'attachments',
                model: File,
                attributes: ['file_name','s3_object_name','file_id','created_date', 'LastModified', 'ContentLength', 'ETag']
            }
        ]
    })
    let endTime8 = new Date();
    let totalTime8= StartTime8.getMilliseconds()-endTime8.getMilliseconds();
     logger.info("GET ALL question  ", totalTime8);
     logger.info("GET ALL question " + fileName) 
     sdc.timing('GET ALL Question', totalTime8)
    res.status(200).send(result)
}
exports.getQuestion = async (req,res) => {
    sdc.increment('GET question');
    let StartTime9 = new Date();
   try{ var result = await QModel.findByPk(req.params.question_id,{
        include: [
            {
                model: Category,
                through: { attributes: [] }
            },
            {
                as: 'answers',
                model: Answer,
                include : {
                    as: 'attachments',
                    model: File,
                    attributes: ['file_name','s3_object_name','file_id','created_date', 'LastModified', 'ContentLength', 'ETag']
                }
            },
            {
                as: 'attachments',
                model: File,
                attributes: ['file_name','s3_object_name','file_id','created_date', 'LastModified', 'ContentLength', 'ETag']
            }]
    })}

   catch(e){ return res.status(404).send({Error: "Question does not exist"})}
   let endTime9 = new Date();
   let totalTime9= StartTime9.getMilliseconds()-endTime9.getMilliseconds();
    logger.info("GET question  ", totalTime9);
    logger.info("GET question " + fileName) 
    sdc.timing('GET Question', totalTime9)
    res.status(200).send(result);
}

exports.attachFile = async (req, res) =>{
    sdc.increment('ATTACH file to question');
    let StartTime10 = new Date();
    var responseObj =  {}
    let decodedData = {};
    if( req.body.user_id || req.body.updated_timestamp || req.body.created_timestamp)
    {
        return res.status(400).json("PLease recheck the inputs")
    }
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        logger.error("bad request"+fileName);
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
        logger.error("unauthorised token for question"+fileName);
        responseObj.result = "unauthorised token";
        return res.send(responseObj);
    }

   var result= decodedData.data.split(':');
    console.log(result[0]);

    let user = await User.findOne({where: {username:result[0]}});

    try{var question = await QModel.findByPk(req.params.question_id)}
    catch(e){logger.error("question does not exist"+fileName);return res.status(404).send({Error: "Question does not exist"})}

   
    if(user.id !== question.user_id) {logger.error("unauthorised user"+fileName);return res.status(401).send({Error: "Unauthorized User"})}


    const fileID = uuid.v4();
    console.log(uuid.v4())
    const upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: "webapp.dave.bhavin",
            key: function (req, file, cb) {
                //question_id+file_id+image_name
                cb(null, req.params.question_id + "/" + fileID + "/" + path.basename( file.originalname, path.extname( file.originalname ) ) + path.extname( file.originalname ) )
            }}),
        fileFilter: function( req, file, cb ){
            checkFileType( file, cb );
        }
    })

    const singleUpload = upload.single('image');
    await singleUpload(req, res, async (err) => {
        if(err) return res.status(400).send(err);
        if(!req.file) return res.status(400).send({Error: 'No File Uploaded'})

        const fileToAttach = {
            file_name: req.file.originalname,
            file_id: fileID,
            s3_object_name: req.file.key
        }
        let params = {
            Bucket: "webapp.dave.bhavin",
            Key: fileToAttach.s3_object_name
        }
        const metadata = await s3.headObject(params).promise();

        fileToAttach.LastModified = metadata.LastModified.toLocaleString()
        fileToAttach.ContentLength = metadata.ContentLength.valueOf()
        fileToAttach.ETag = metadata.ETag.valueOf()

        const file = await File.create(fileToAttach);
        await question.addAttachment(file);
        let endTime10 = new Date();
        let totalTime10= StartTime10.getMilliseconds()-endTime10.getMilliseconds();
         logger.info("ATTACH FILE  ", totalTime10);
         logger.info("ATTACH FILE " + fileName) 
         sdc.timing('ATTACH FILE', totalTime10)
        return res.status(201).send(file);

    })

}

function checkFileType( file, cb ){
    //check file
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test( path.extname( file.originalname ).toLowerCase());
    const mimetype = filetypes.test( file.mimetype );
    if( mimetype && extname ){
        return cb( null, true );
    } else {
        cb( 'Error' );
    }
}
exports.deleteFile = async (req, res) => {
    sdc.increment('DELETE FILE of the question');
    let StartTime11 = new Date();
    var responseObj =  {}
    let decodedData = {};
    if( req.body.user_id || req.body.updated_timestamp || req.body.created_timestamp)
    {
        logger.error("wrong inputs"+fileName);
        return res.status(400).json("PLease recheck the inputs")
    }
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        logger.error("bad request"+fileName);
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
        logger.error("unauthorised token"+fileName);
        responseObj.result = "unauthorised token";
        return res.send(responseObj);
    }

   var result= decodedData.data.split(':');
    console.log(result[0]);

    let user = await User.findOne({where: {username: result[0]}});

    try{var question = await QModel.findByPk(req.params.question_id)}
    catch(e){logger.error("question does not exist"+fileName);return res.status(404).send({Error: "Question does not exist"})}


    if(user.id !== question.user_id) {logger.error("unauthorised user"+fileName);return res.status(401).send({Error: "User unauthorized"})}

    let file = await question.getAttachments({ where: {file_id: req.params.file_id}})
    if(file.length === 0) {logger.error("file not found for that question"+fileName);return res.status(404).send({Error: "File not found for given question"})}

    file = file[0];

    await question.removeAttachment(file);

    await File.destroy({where: {file_id: req.params.file_id}})

    let params = {
        Bucket: "webapp.dave.bhavin",
        Key: file.s3_object_name
    }
    s3.deleteObject(params, function(err, data) {
        if (err) console.log(err, err.stack);
        else    {
            let endTime11 = new Date();
            let totalTime11= StartTime11.getMilliseconds()-endTime11.getMilliseconds();
             logger.info("DELETE FILE  ", totalTime11);
             logger.info("DELETE FILE " + fileName);
             sdc.timing('DELETE FILE ', totalTime11);
             return res.status(204).send();} 
    });

}
