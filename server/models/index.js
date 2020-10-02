
var Sequelize = require('sequelize');
var sequelize = new Sequelize(process.env.database,process.env.username,process.env.password,
  {
    "username": "root",
    "password": "222909@Rg$", 
    "database": "webapp", 
    "host": "127.0.0.1", 
    "port":"3306",
    "dialect": "mysql"
  }
);
module.exports = {
  sequelize : sequelize
}