
const QModel = require("../models/question").Question;
const bcrypt = require('bcryptjs');
const { Category } = require("../models/categories").Category;

function create(QData, callback) {
    QModel.create(QData).then(function (question) {
        QModel.findOne({ where: { question_id: question.dataValues.question_id }, include: Category }).then(function (result) {
            return callback(null, result);
        }).catch(function (error) {
            return callback("Error in finding one after using create function ", null);
        })
    }).catch(function (error) {
        if(error=="SequelizeUniqueConstraintError: Validation error")  return callback("Duplicate question posted", null);
        return callback("error in creating bill " + error, null);
    })
}
/*
async function create(QData, callback) {
    console.log(QData);
  const [question, created] = await QModel.findOrCreate({
     where: { question_id: QData.question_id },
     defaults: {
        question_text: QData.question_text
      }
    });
    if (created) {
      return callback("null", question.get({plain: true }));
    } else {
             
        return callback("error in creating bill " + error, null);
  }
  }

*/

module.exports = {
    create
}
