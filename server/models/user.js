const Sequelize = require('sequelize');
const uuid = require("uuid");
const path = require("path");

const sequelize = require(path.resolve(".") + "/server/models/index.js").sequelize;


var User = sequelize.define('users', {
    id: {
        allowNull: false,
        primaryKey: true,
        unique: true,
        type: Sequelize.UUID,
        defaultValue: uuid.v4()
    },
    first_name: {
        type: Sequelize.STRING,
        allowNull: false,
        
    },
    last_name: {
        type: Sequelize.STRING,
       allowNull: false,
    },
    password: {
        type: Sequelize.STRING,
        allowedNull: false
    },
    username: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
    }
},
{
    updatedAt: 'Account_updated',
    createdAt: 'Account_created'
});
sequelize.sync();
module.exports = {
    User
}