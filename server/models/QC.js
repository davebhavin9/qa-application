const Sequelize = require('sequelize');
const uuid = require("uuid");
const path = require("path");

const sequelize = require(path.resolve(".") + "/server/models/index.js").sequelize;


var QC = sequelize.define('QC', {
    category_id: {
        allowNull: false,
        foreignKey:true,
        type: Sequelize.UUID,
    },
    question_id: {
        allowNull: false,
        foreignKey:true,
        type: Sequelize.UUID,
    }
});
sequelize.sync();
module.exports = {
    QC
}