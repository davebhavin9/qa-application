const path = require("path");
const Data = require(path.resolve(".") + "/server/auth/authentication");
const QAuth = require(path.resolve(".") + "/server/auth/QAuth");

const bcrypt = require('bcryptjs');
const uuid = require('uuid');


 async function createQuestion(decodeData, Question, callback) {
 await   Data.getUserID(decodeData.data,async function (error, resultforID) {
        if (error)  return callback(error, null);
        else {
            Question.user_id = resultforID.dataValues.id;
            Question.question_id = uuid.v4();
            await QAuth.create(Question, async function (error, result) {
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