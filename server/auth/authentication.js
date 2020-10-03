
const User = require("../models/user").User;
const bcrypt = require('bcryptjs');


async function createUsers(userData, callback) {
const [user, created] = await User.findOrCreate({
    where: { username: userData.username },
    defaults: {
        first_name: userData.first_name,
        last_name: userData.last_name,
        password:userData.password
      }
  });
  if (created) {
    return callback(null, user.get({ plain: true }));
  } else {
           
    return callback("user already exists", null);
}
}

async function getUser(dataObj, callback) {
    const SplitArray = dataObj.data.split(":")
    const userID = SplitArray[0];
    const password = SplitArray[1]

    
    await User.findOne({ where: { username: userID }, attributes: ['password'] }).then(
        async function (pass) {
            await bcrypt.compare(password, pass.password).then(async function (res) {
                if (res == true) {
                    let result = await User.findOne({ where: { username: userID, password: pass.password }, attributes: ['id','first_name', 'last_name', 'username', 'Account_created', 'Account_updated'] })
                    
                    return callback(null, result);
                }
                else {
                    return callback("Authentication failed, please try again", null)
                }
            })
        }
    ).catch(function (error) {

        return callback("user account not found", null)
    })
    return null;
}

async function editUser(data, payload, callback) {
    const SplitArray = data.split(':')
    const userID = SplitArray[0];
    const password = SplitArray[1];
    await User.findOne({ where: { username: userID }, attributes: ['password'] }).then(async function (pass) {
      
        await bcrypt.compare(password, pass.password).then(function (res) {
            if (res == true) {
                User.update(payload, { where: { username: userID, password: pass.password }   })
                    .then(function (user) {
                        User.findOne({ where: { username: userID } }).then(function (user) {
                            return callback(null, "user updated")
                        }).catch(function (error) {
                            return callback(error, null);
                        })
                    }

                    ).catch(function (error) {
                        return callback(error, null)
                    })
            }
            else {
                return callback("password authentication failed", null);
            }
        });
    }).catch(function (error) {
        return callback("user account not found", null)
    })
}
function getUserID(data, callback) {
    const SplitArray = data.split(':')
    const userID = SplitArray[0];
    const password = SplitArray[1];
    User.findOne({ where: { username: userID }, attributes: ['password'] }).then(
        async function (pass) {
            if (pass) {
                await bcrypt.compare(password, pass.password).then(async function (res) {
                    if (res) {
                        User.findOne({ where: { username: userID }, attributes: ['id'] }).then(
                            function (id) {
                                return callback(null, id);
                            }
                        )
                    }
                    else {
                        return callback("password authentication failed", null);
                    }
                })
            }
            else {
                return callback("user not found", null)
            }

        }).catch(function (error) {
            return callback("user account not found", null)
        });
}
module.exports = {
    createUsers: createUsers,
    getUser,
    editUser,
    getUserID
}