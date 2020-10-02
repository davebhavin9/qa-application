'use strict';
const express = require("express");
const db = require('./models/index');
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const path = require("path");
//const index = require(path.resolve(".") + "/server/models/index.js");
const router = require(path.resolve(".") + "/server/controllers/user-controller.js");
const port = 8080;

require('dotenv').config();


app.use(bodyParser.json());
app.use(cors());
//Routes
app.use( router);




app.listen(port, function () {
  console.log("Express server listening on port %s.", port);
});

// error handler
app.use(function(err, req, res, next) {
  res.status(400);
  console.log("app is running");
  res.send(err);
});



module.exports = app;