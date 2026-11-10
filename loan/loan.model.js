const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Loan = sequelize.define(
  'Loan',
  {
    loanDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    dueDate: { type: DataTypes.DATE, allowNull: false },
    returnDate: { type: DataTypes.DATE, allowNull: true },
    status: { type: DataTypes.ENUM('ATIVO', 'DEVOLVIDO', 'ATRASADO'), allowNull: false, defaultValue: 'ATIVO' },
    fine: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      get() {
        return Number(this.getDataValue('fine'));
      },
    },
    bookId: { type: DataTypes.INTEGER, allowNull: false },
    readerId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
  },
  { tableName: 'loans' }
);

module.exports = Loan;
