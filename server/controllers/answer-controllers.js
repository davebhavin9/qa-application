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

    answer = await Answer.findOne({
        where : {answer_id: answer.answer_id},
        include : {
            as: 'attachments',
            model: File,
            attributes: ['file_name','s3_object_name','file_id','created_date', 'LastModified', 'ContentLength', 'ETag']
        }
    });


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

    let files = await answer.getAttachments()
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

    answer = await Answer.findByPk(req.params.answer_id,{
        include : {
            as: 'attachments',
            model: File,
            attributes: ['file_name','s3_object_name','file_id','created_date', 'LastModified', 'ContentLength', 'ETag']
        }
    })

    return res.status(200).send(answer)

}
exports.attachFile = async (req, res) =>{
    
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

    let user = await User.findOne({where: {username: result[0]}});

    try{ var question = await QModel.findByPk(req.params.question_id)}
    catch(e){return res.status(404).send({Error: "Question not found"})}


    let answer = await question.getAnswers({ where: {answer_id: req.params.answer_id}});
    if(answer.length === 0) return res.status(404).send({Error: "Answer not found for given question"})

    answer = answer[0];
    if(answer.user_id !== user.id) return res.status(401).send({Error: "User unauthorised"})

    const fileID = uuid.v4();
    const upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: "webapp.dave.bhavin",
            key: function (req, file, cb) {
                //answer_id+fileID+name
                cb(null, req.params.answer_id + "/" + fileID + "/" + path.basename( file.originalname, path.extname( file.originalname ) ) + path.extname( file.originalname ) )
            }}),
        fileFilter: function( req, file, cb ){
            checkFileType( file, cb );
        }
    })

    const singleUpload = upload.single('image');
    await singleUpload(req, res, async (err) => {
        if(err) return res.status(400).send(err);
        if(!req.file) return res.status(400).send({Error: 'No image is attached'})

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
        await answer.addAttachment(file);

        return res.status(201).send(file);

    })

}

function checkFileType( file, cb ){
    //checking image
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

    let user = await User.findOne({where: {username: result[0]}});

    try{var question = await QModel.findByPk(req.params.question_id)}
    catch(e){return res.status(404).send({Error: "Question does not exist"})}

    
    let answer = await question.getAnswers({ where: {answer_id: req.params.answer_id}});
    if(answer.length === 0) return res.status(404).send({Error: "Answer does not exist for given question"})

    answer = answer[0];
    if(answer.user_id !== user.id) return res.status(401).send({Error: " Unauthorised User"})
    let file = await answer.getAttachments({ where: {file_id: req.params.file_id}})
    if(file.length === 0) return res.status(404).send({Error: "IMAGES does not exist for the given answer"})
    file = file[0];
    await answer.removeAttachment(file);

    await File.destroy({where: {file_id: req.params.file_id}})

    let params = {
        Bucket: "webapp.dave.bhavin",
        Key: file.s3_object_name
    }
    s3.deleteObject(params, function(err, data) {
        if (err) console.log(err, err.stack);  
        else    return res.status(204).send(); 
    });

}
