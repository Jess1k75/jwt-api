const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { required } = require('../utils/validators');

const Category = sequelize.define(
  'Category',
  {
    name: { type: DataTypes.STRING, allowNull: false, unique: true, validate: required('O nome da categoria') },
    description: { type: DataTypes.STRING, allowNull: true },
  },
  { tableName: 'categories' }
);

module.exports = Category;
