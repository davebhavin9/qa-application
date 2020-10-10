const Sequelize = require('sequelize');
const uuid = require("uuid");
const path = require("path");




module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("users", {
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
        },

    },{
        updatedAt: 'Account_updated',
        createdAt: 'Account_created'
    });

    return User;
};