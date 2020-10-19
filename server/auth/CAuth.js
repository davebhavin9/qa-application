const Category = require("../models/categories").Category;
const bcrypt = require('bcryptjs');
const  uuid  = require('uuid');

async function create(categoryData, callback) {
  console.log(categoryData);
const [category, created] = await Category.findOrCreate({
    where: { category: categoryData },
    defaults: {
        category_id:uuid.v4(),
        category:categoryData,
    }
  });
  console.log("idhar pauche"+categoryData)
  console.log("created"+category)
  if (created) {
    return callback(null, category.get({ }));
  } else {
           
    return callback(null, category.get({ plain: true }));
}
}




module.exports = {
    create
}
