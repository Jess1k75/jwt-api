const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { required } = require('../utils/validators');

const Book = sequelize.define(
  'Book',
  {
    title: { type: DataTypes.STRING, allowNull: false, validate: required('O título') },
    isbn: { type: DataTypes.STRING, allowNull: false, unique: true, validate: required('O ISBN') },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: { msg: 'O ano deve ser um número inteiro.' },
        min: { args: [0], msg: 'O ano deve ser positivo.' },
        max: { args: [new Date().getFullYear() + 1], msg: 'O ano não pode estar no futuro.' },
      },
    },
    totalCopies: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        notNull: { msg: 'O total de exemplares é obrigatório.' },
        isInt: { msg: 'O total de exemplares deve ser um número inteiro.' },
        min: { args: [1], msg: 'O total de exemplares deve ser pelo menos 1.' },
      },
    },
    availableCopies: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: { args: [0], msg: 'Exemplares disponíveis não pode ser negativo.' } },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { notNull: { msg: 'A categoria é obrigatória.' } },
    },
  },
  { tableName: 'books' }
);

module.exports = Book;
