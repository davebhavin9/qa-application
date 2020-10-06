const Sequelize = require('sequelize');
const uuid = require("uuid");
const path = require("path");

const sequelize = require(path.resolve(".") + "/server/models/index.js").sequelize;


var Answer = sequelize.define('Answer', {
    answer_id: {
        allowNull: false,
        unique: true,
        type: Sequelize.UUID,
    },
    question_id: {
        type: Sequelize.UUID,
       allowNull: false,
    },
    user_id: {
        allowNull: false,
        //primaryKey: true,
      //  unique: true,
        type: Sequelize.UUID,
        defaultValue: uuid.v4()
    },
    answer_text: {
        type: Sequelize.STRING,
       allowNull: false,
       unique: true,
    }
},
{
    updated_timestamp: 'Answer_updated',
    created_timestamp: 'Answer_created'
});
sequelize.sync();
module.exports = {
    Answer
}