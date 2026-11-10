const sequelize = require('../config/db');
const User = require('../user/user.model');
const RefreshToken = require('../auth/refreshToken.model');
const Category = require('../category/category.model');
const Author = require('../author/author.model');
const Book = require('../book/book.model');
const BookAuthor = require('../book/bookAuthor.model');
const Reader = require('../reader/reader.model');
const Loan = require('../loan/loan.model');

//1:N  Category 
Category.hasMany(Book, { foreignKey: 'categoryId', as: 'books', onDelete: 'RESTRICT' });
Book.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

//N:N Author 
Book.belongsToMany(Author, { through: BookAuthor, foreignKey: 'bookId', otherKey: 'authorId', as: 'authors' });
Author.belongsToMany(Book, { through: BookAuthor, foreignKey: 'authorId', otherKey: 'bookId', as: 'books' });

//1:N Reader
Book.hasMany(Loan, { foreignKey: 'bookId', as: 'loans', onDelete: 'RESTRICT' });
Loan.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });
Reader.hasMany(Loan, { foreignKey: 'readerId', as: 'loans', onDelete: 'RESTRICT' });
Loan.belongsTo(Reader, { foreignKey: 'readerId', as: 'reader' });
User.hasMany(Loan, { foreignKey: 'userId', as: 'loans', onDelete: 'RESTRICT' });
Loan.belongsTo(User, { foreignKey: 'userId', as: 'attendant' });

//1:N User
User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { sequelize, User, RefreshToken, Category, Author, Book, BookAuthor, Reader, Loan };
