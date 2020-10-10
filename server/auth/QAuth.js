
const bcrypt = require('bcryptjs');
const db=require("../models")
const User = db.users;
const Category = db.categories;
const QModel = db.questions;
function create(QData, callback) {
    QModel.create(QData).then(function (question) {
        QModel.findOne({ where: { question_id: question.dataValues.question_id } }).then(function (result) {
            return callback(null, result);
        }).catch(function (error) {
         //   return callback("Error in finding one after using create function ", null);
        })
    }).catch(function (error) {
        if(error=="SequelizeUniqueConstraintError: Validation error")  return callback("Duplicate question posted", null);
        return callback("error in creating question " + error, null);
    })
}

module.exports = {
    create
}
