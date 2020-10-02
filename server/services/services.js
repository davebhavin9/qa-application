
const path = require("path");
const Data = require(path.resolve(".") + "/server/auth/authentication");

const bcrypt = require('bcryptjs');

function createUser(userData, callback) {
    Data.createUsers(userData, function (error, result) {
        if (error) {
            return callback(error, null);
        }
        else {
            return callback(null, result);
        }
    })
    return;
}

function getUser(decodeObject, callback) {
    Data.getUser(decodeObject, function (error, result) {
        if (error) {
            return callback(error, null);
        }
        else {
            return callback(null, result)
        }
    })
    return;
}

function editUser(decodeObject, payload, callback) {
    const data = decodeObject.data
    delete payload.username
    delete payload.createdAt
    delete payload.updatedAt
    if (payload.password) {
        var hashedPassword = bcrypt.hashSync(payload.password, 10);
        delete payload.password;
        payload.password = hashedPassword
    }
    Data.editUser(data, payload, function (error, result) {
        if (error) {

            return callback(error, null);
        }
        else {
            return callback(null, result)
        }
    })
    return;
}
module.exports = {
    createUser,
    getUser,
    editUser
}