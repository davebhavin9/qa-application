module.exports = (sequelize, Sequelize) => {
    const Category = sequelize.define("category",{
        category_id: {
            allowNull: false,
            primaryKey:true,
            type: Sequelize.UUID,
        },
        category: {
            type: Sequelize.STRING,
            allowNull: false,
        }
    },{
        timestamps: false
    });
    sequelize.sync();
    return Category;
}