
var Sequelize = require('sequelize');
var sequelize = new Sequelize(process.env.database,process.env.username,process.env.password,
  {
    "username": "root",
    "password": "222909@Rg$", 
    "database": "webapp", 
    "host": "127.0.0.1", 
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

const User = db.users;
const Answer = db.answers;
const Category = db.categories;
const Question = db.questions;

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


module.exports = db;