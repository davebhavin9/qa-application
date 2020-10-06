const path = require("path");
const Data = require(path.resolve(".") + "/server/auth/authentication");
const QAuth = require(path.resolve(".") + "/server/auth/QAuth");

const bcrypt = require('bcryptjs');
const uuid = require('uuid');


function createQuestion(decodeData, Question, callback) {
    Data.getUserID(decodeData.data, function (error, resultforID) {
        if (error)  return callback(error, null);
        else {
            Question.user_id = resultforID.dataValues.id;
            Question.question_id = uuid.v4();
            QAuth.create(Question, function (error, result) {
                if (error) {
                    return callback(error, null);
                }
                else {
                    return callback(null, result)
                }
            })
        }
    })
}
module.exports = {
    createQuestion
}