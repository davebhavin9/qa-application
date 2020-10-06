const Sequelize = require('sequelize');
const uuid = require("uuid");
const path = require("path");

const sequelize = require(path.resolve(".") + "/server/models/index.js").sequelize;


var Category = sequelize.define('RANDOM', {
    category_id: {
        allowNull: false,
        primaryKey:true,
        type: Sequelize.UUID,
    },
    category: {
        type: Sequelize.STRING
    }
});
sequelize.sync();
module.exports = {
    Category
}