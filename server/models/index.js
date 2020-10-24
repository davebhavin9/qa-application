
var Sequelize = require('sequelize');
require('dotenv').config();
const pass=process.env.password;
const host=process.env.host;

var sequelize = new Sequelize(process.env.database,process.env.username,process.env.password,
  {
    "username": "csye6225fall2020",
    "password": "foobarbaz", 
    "database": "csye6225", 
    "host": host, 
    "port":"3306",
    "dialect": "mysql"
  }
);
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./user.js")(sequelize, Sequelize);
db.answers = require("./Answers")(sequelize,Sequelize);
db.categories = require("./categories")(sequelize,Sequelize);
db.questions = require("./question")(sequelize, Sequelize);
db.file=require("./File")(sequelize, Sequelize);

const User = db.users;
const Answer = db.answers;
const Category = db.categories;
const Question = db.questions;
const File = db.file;

User.hasMany(Question,{
    as: 'questions',
    foreignKey:{
        name: 'user_id'
    }
})

User.hasMany(Answer, {
    as: 'answer',
    foreignKey: {
        name: 'user_id'
    }
})

db.categories.belongsToMany(db.questions, {through: 'QuestionsCategory'})
db.questions.belongsToMany(db.categories, {through: 'QuestionsCategory'})

db.questions.hasMany(db.answers, {
    as: 'answers',
    foreignKey: {
        name : "question_id",
        type: Sequelize.UUID
    }
})
Question.hasMany(File, {
    as: 'attachments',
    foreignKey: {
        name: 'question_id'
    }
})

Answer.hasMany(File, {
    as: 'attachments',
    foreignKey: {
        name: 'answer_id'
    }
})

sequelize.sync();
module.exports = db;