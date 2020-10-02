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

router.get("/check", function (req, res) {
  res.statusCode = 200;
  res.statusMessage = "OK"
  res.send();
})


router.post("/v1/user", [
  check('first_name').isString().exists(),
  check('last_name').exists().isString(),
  check('username').exists().isEmail(),
  check('password').exists()
], async function (req, res) {
  let createUserStartTime = new Date();
  let responseObj = {};
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  var schema = new passwordValidator();
  schema.is().min(8).has().digits().has().lowercase().has().uppercase()
  if (!schema.validate(req.body.password)) {
    return res.status(400).json("Password should be 8 character long, must have atleast one digit, one lower case,one upper case")
  }
  var hashedPassword = bcrypt.hashSync(req.body.password,10);
  console.log(uuid.v4());
  var userData = {
    id: uuid.v4(),
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    username: req.body.username,
    password: hashedPassword,
    
  }
  userService.createUser(userData, function (error, result) {
    if (error) {
      res.statusCode = 400;
      responseObj.result = error
      res.send(responseObj);
    }
    else {
      res.statusCode = 201;
      res.statusMessage = "User Created"
      delete result.password;
      responseObj.result = result;
      let createUserEndTime = new Date();
      let createUserTime = createUserStartTime.getMilliseconds() - createUserEndTime.getMilliseconds()
      res.send(responseObj);
    }
  })
});

router.get("/v1/user/self", function (req, res) {
  const responseObj = {}
  let decodedData = {};
 
  const bHeader = req.headers.authorization;
  console.log(bHeader);
  if (typeof bHeader == "undefined") {
    res.statusCode = 401;
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
      res.statusCode = 200;
      res.statusMessage = "OK";
      responseObj.result = result;
      res.send(responseObj);
    }
    else {
      res.statusCode = 400
      res.statusMessage = "Failed in fetching the data";
      responseObj.error = error
      res.send(responseObj);
    }
  })

})
router.put("/v1/user/self", function (req, res) {
  let responseObj = {}
  let decodedData = {};
  const bHeader = req.headers.authorization;
  if (typeof bHeader == "undefined") {
    res.statusCode = 401;
    responseObj.result = "Unautherized Tocken";
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
      return res.status(400).json('Incomplete payload')
    }
  }
  checkPload(req);
  
  userService.editUser(decodedData, req.body, function (error, result) {
    if (error) {
      res.statusCode = 400
      res.statusMessage = "Bad Request"
      responseObj.error = error
      res.send(responseObj);
    }
    else {
      res.statusCode = 204
      res.statusMessage = "NO CONTENT"
      delete result.password;
      responseObj.result = result;
      res.send(responseObj);
    }
  })
})

module.exports = router;