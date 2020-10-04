const Sequelize = require('sequelize');
const uuid = require("uuid");
const path = require("path");

const sequelize = require(path.resolve(".") + "/server/models/index.js").sequelize;


var Category = sequelize.define('Category', {
    category_id: {
        allowNull: false,
        primaryKey: true,
        unique: true,
        type: Sequelize.UUID,
        defaultValue: uuid.v4()
    },
    category: {
        type: Sequelize.STRING,
       allowNull: false,
    }
});
sequelize.sync();
module.exports = {
    Category
}