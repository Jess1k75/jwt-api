const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { required } = require('../utils/validators');

const Reader = sequelize.define(
  'Reader',
  {
    name: { type: DataTypes.STRING, allowNull: false, validate: required('O nome do leitor') },
    cpf: {
      type: DataTypes.STRING(11),
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue('cpf', value == null ? value : String(value).replace(/\D/g, ''));
      },
      validate: { notNull: { msg: 'O CPF é obrigatório.' }, len: { args: [11, 11], msg: 'O CPF deve ter 11 dígitos.' } },
    },
    email: { type: DataTypes.STRING, allowNull: true, validate: { isEmail: { msg: 'E-mail inválido.' } } },
    phone: { type: DataTypes.STRING, allowNull: true },
  },
  { tableName: 'readers' }
);

module.exports = Reader;
