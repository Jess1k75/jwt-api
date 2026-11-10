const sequelize = require('../config/db');

const BookAuthor = sequelize.define('BookAuthor', {}, { tableName: 'book_authors', timestamps: false });

module.exports = BookAuthor;
