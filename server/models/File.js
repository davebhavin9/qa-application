const uuid = require("uuid");
module.exports = (sequelize, Sequelize) => {

    const File = sequelize.define("file",{
        file_name : {
            type: Sequelize.STRING,
            allowNull: false
        },
        s3_object_name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        file_id : {
            type: Sequelize.UUID,
            primaryKey: true
        },
        LastModified: {
            type: Sequelize.STRING,
            allowNull: false
        },
        ETag: {
            type: Sequelize.STRING,
            allowNull: false
        },
        ContentLength: {
            type: Sequelize.STRING,
            allowNull: false
        }
    }, {
        timestamps: true,
        createdAt: "Created_Date",
        updatedAt: false
    });

    return File

}