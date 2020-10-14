
const uuid = require("uuid");


module.exports = (sequelize, Sequelize) => {
    const Answer = sequelize.define("answer",{
        answer_id : {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false
        },
        answer_text: {
            type: Sequelize.STRING,
            allowNull: false
        }
    }, {
        createdAt: "Answer_updated",
        updatedAt: "Answer_created"
    });
    sequelize.sync();
    return Answer
}
