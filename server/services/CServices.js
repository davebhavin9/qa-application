const path = require("path");
const Data = require(path.resolve(".") + "/server/auth/authentication");
const CAuth = require(path.resolve(".") + "/server/auth/CAuth");

const bcrypt = require('bcryptjs');
const uuid = require('uuid');


function createCategory(decodeData, Category, callback) {
    Data.getUserID(decodeData.data, function (error, resultforID) {
        console.log("DEcoded data"+decodeData.decodeData)
        if (error)  return callback(error, null);
        else {
           for(let i=0;i<Category.length;i++){
               console.log("Category"+Category[i].category)
            CAuth.create(Category[i].category, function (error, result) {
                if (error) {
                    return callback(error, null);
                }
                else {
                    return callback(null, result)
                }
            })
           }
        }
    })
}
function getUserbyID( payload, callback) {  
    Data.getUserID2(payload, function (error, result) {
        if (error) {
            return callback(error, null);
        }
        else {
            return callback(null, result)
        }
    })
}
           
    

module.exports = {
    createCategory,
    getUserbyID
}