const Sequelize = require('sequelize');
const uuid = require("uuid");
const path = require("path");

const sequelize = require(path.resolve(".") + "/server/models/index.js").sequelize;


var Question = sequelize.define('Question', {
    question_id: {
        allowNull: false,
        primaryKey: true,
       // unique: true,
        type: Sequelize.UUID,
        defaultValue: uuid.v4()
    },
    user_id: {
        allowNull: false,
        //primaryKey: true,
      //  unique: true,
        type: Sequelize.UUID,
        defaultValue: uuid.v4()
    },
    question_text: {
        type: Sequelize.STRING,
       allowNull: false,
       unique: true,
    }
},
{
    updated_timestamp: 'Question_updated',
    created_timestamp: 'Question_created'
});
sequelize.sync();
module.exports = {
    Question
}