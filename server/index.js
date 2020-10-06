'use strict';
const express = require("express");
const db = require('./models/index');
const Sequelize = require('sequelize');
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const path = require("path");
const User = require(path.resolve(".") + "/server/models/user.js").User;
const QModel = require(path.resolve(".") + "/server/models/question.js").Question;
const router = require(path.resolve(".") + "/server/controllers/user-controller.js");
const Qrouter = require(path.resolve(".") + "/server/controllers/question-controller.js");
const Category = require(path.resolve(".") + "/server/models/categories.js").Category;


const port = 8080;

require('dotenv').config();


app.use(bodyParser.json());
app.use(cors());




User.hasMany(QModel,{as: 'questions', foreignKey: 'user_id'})
//User.hasMany(QModel,{as: 'questions', foreignKey: 'user_id'})

QModel.belongsToMany(Category, { through:"Category",foreignKey: 'category_id'});
Category.belongsToMany(QModel, { through:"Category",foreignKey: 'question_id'});


app.use( router);
app.use( Qrouter);





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