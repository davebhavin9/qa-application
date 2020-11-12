const express = require("express");
const bcrypt = require('bcryptjs');
const router = express.Router();
const base64 = require('base-64');
//const { v4: uuidv4 } = require('uuid');

const uuid = require('uuid');
const path = require("path");
//const app = express();

const userService = require(path.resolve(".") + "/server/services/services.js");
const { check, validationResult } = require('express-validator');
var passwordValidator = require('password-validator');
//const { Router } = require("express");
const app = require("..");
var fileName= "user-controller.js";
const logger = require('../logger/logger')
const SDC = require('statsd-client'), sdc = new SDC({host: 'localhost', port: 8125});




router.get("/check", function (req, res) {
  res.statusCode = 200;
  res.statusMessage = "OK"
  res.send();
})

//GET
//AUTHENTICATED

router.get("/v1/user/self", function (req, res) {
  let StartTime = new Date();
  sdc.increment('GET user');
  logger.info("Route name ,GET to " + fileName)
  const responseObj = {}
  let decodedData = {};
 
  const bHeader = req.headers.authorization;
  console.log(bHeader);
  if (typeof bHeader == "undefined") {
    res.statusCode = 401;
    logger.debug("Unautherized Tocken"+ fileName);
    responseObj.result = "Unautherized Tocken";
    res.send(responseObj);

  }
  else {
    const bearer = bHeader.split(' ')
    const bToken = bearer[1]
    decodedData.data = base64.decode(bToken);

  }
  userService.getUser(decodedData, function (error, result) {
    if (!error) {
      let endTime = new Date();
      let totalTime= StartTime.getMilliseconds()-endTime.getMilliseconds();
      logger.info("Get user time ", totalTime);
      logger.info("GET req complete" + fileName) 
      sdc.timing('GET req complete', totalTime)
      res.statusCode = 200;
      res.statusMessage = "OK";
      responseObj.result = result;
      res.send(responseObj);
    }
    else {
      logger.debug("GET req error" + fileName) 
      
      res.statusCode = 400
      res.statusMessage = "Failed in fetching the data";
      responseObj.error = error
      res.send(responseObj);
    }
  })

})
//AUTHENTICATED
//PUT
router.put("/v1/user/self", function (req, res) {
  sdc.increment('PUT user');
  let StartTime = new Date();
  logger.info("Route name ,POST to " + fileName)
  let responseObj = {}
  let decodedData = {};
  const bHeader = req.headers.authorization;
  if (typeof bHeader == "undefined") {
    res.statusCode = 401;
    responseObj.result = "Unautherized Tocken";
    logger.debug("Unautherized Tocken"+ fileName);
    res.send(responseObj);

  }
  else {
    const bearer = bHeader.split(' ')
    const bToken = bearer[1]
    decodedData.data = base64.decode(bToken);
  }
  function checkPload(req) {
    if (!req.body.first_name || !req.body.last_name || !req.body.password || !req.body.username) {
      res.statusCode = 400;
      logger.debug("Incomplete payload");
      return res.status(400).json('Incomplete payload')
    }
  }
  checkPload(req);
  
  userService.editUser(decodedData, req.body, function (error, result) {
    if (error) {
      logger.debug("Error in edit user route ", fileName)
      
      res.statusCode = 400
      res.statusMessage = "Bad Request"
      responseObj.error = error
      res.send(responseObj);
    }
    else {
      logger.info("Update user route complete ", fileName)
      let endTime = new Date();
      let totalTime= StartTime.getMilliseconds()-endTime.getMilliseconds();
      logger.info("Update user time ", totalTime);
      sdc.timing('Update user time', totalTime)
      res.statusCode = 204
      res.statusMessage = "User Updated"
      delete result.password;
      responseObj.result = result;
      res.send(responseObj);
    }
  })
})
//Unauthenticated
//POST
router.post("/v1/user", [
  check('first_name').isString().exists(),
  check('last_name').exists().isString(),
  check('username').exists().isEmail(),
  check('password').exists()
], async function (req, res) {
  sdc.increment('POST user');
  logger.info("Route name ,POST to " + fileName)
  let responseObj = {};
  let StartTime = new Date();
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    logger.debug("bad request for POST user");
    return res.status(400).json({ errors: errors.array() })
  }
  var schema = new passwordValidator();
  schema.is().min(8).has().digits().has().lowercase().has().uppercase()
  if (!schema.validate(req.body.password)) {
    logger.debug("password not compatible");
    return res.status(400).json("Password should be 8 character long, must have atleast one digit, one lower case,one upper case")
  }
  var hashedPassword = bcrypt.hashSync(req.body.password,10);
  console.log(uuid.v4());
  var userData = {
    id: uuid.v4(),
    username: req.body.username,
    password: hashedPassword,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
  }
  userService.createUser(userData, function (error, result) {
    if (error) {
      logger.debug("Error in creating user route " + fileName);
      res.statusCode = 400;
      responseObj.result = error
      res.send(responseObj);
    }
    else {
      let endTime = new Date();
      let totalTime= StartTime.getMilliseconds()-endTime.getMilliseconds();
      logger.info("Create user time ", totalTime);
      sdc.timing('Create_user_time', totalTime)
      
      res.statusCode = 201;
      res.statusMessage = "User Created"
      delete result.password;
      responseObj.result = result;
      res.send(responseObj);
    }
  })
});


module.exports = router;