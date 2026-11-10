const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { required } = require('../utils/validators');

const Author = sequelize.define(
  'Author',
  {
    name: { type: DataTypes.STRING, allowNull: false, validate: required('O nome do autor') },
    nationality: { type: DataTypes.STRING, allowNull: true },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: { isDate: { msg: 'Data de nascimento inválida (use AAAA-MM-DD).' } },
    },
  },
  { tableName: 'authors' }
);

module.exports = Author;
