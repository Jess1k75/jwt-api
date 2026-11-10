const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { required } = require('../utils/validators');

const User = sequelize.define(
  'User',
  {
    name: { type: DataTypes.STRING, allowNull: false, validate: required('O nome') },
    username: { type: DataTypes.STRING, allowNull: false, unique: true, validate: required('O username') },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { ...required('O e-mail'), isEmail: { msg: 'E-mail inválido.' } },
    },
    password: { type: DataTypes.STRING, allowNull: false },
    isAdmin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  {
    tableName: 'users',
    // a senha nunca sai nas consultas normais (use User.unscoped() para o login)
    defaultScope: { attributes: { exclude: ['password'] } },
  }
);

module.exports = User;
