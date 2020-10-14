
const uuid = require("uuid");

module.exports = (sequelize, Sequelize) => {
const Question = sequelize.define("Question",{
    question_id : {
        allowNull: false,
        primaryKey: true,
       // unique: true,
        type: Sequelize.UUID,
        defaultValue: uuid.v4()
    },
    question_text: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    }
}, {
    createdAt: "Question_created",
    updatedAt: "Question_updated"
});

sequelize.sync();
return Question

}