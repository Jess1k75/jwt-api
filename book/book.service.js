const { Op } = require('sequelize');
const { sequelize, Book, Author, Category, BookAuthor, Loan } = require('../models');
const HttpError = require('../utils/httpError');
const { pick } = require('../utils/parse');

const INCLUDE = [
  { model: Category, as: 'category' },
  { model: Author, as: 'authors', through: { attributes: [] } },
];

async function checkCategory(categoryId) {
  const category = await Category.findByPk(categoryId);
  if (!category) throw new HttpError(400, 'Categoria informada não existe.');
}

async function checkAuthors(authorIds) {
  if (!Array.isArray(authorIds)) throw new HttpError(400, 'Informe "authorIds" como uma lista de IDs.');
  const ids = [...new Set(authorIds.map(Number))];
  if (ids.some((n) => !Number.isInteger(n) || n <= 0)) throw new HttpError(400, 'Lista de autores inválida.');
  const found = await Author.count({ where: { id: ids } });
  if (found !== ids.length) throw new HttpError(400, 'Um ou mais autores informados não existem.');
  return ids;
}

exports.list = async ({ title, categoryId, authorId, available } = {}) => {
  const where = {};
  if (title) where.title = { [Op.like]: `%${title}%` };
  if (categoryId) where.categoryId = Number(categoryId);
  if (available === 'true') where.availableCopies = { [Op.gt]: 0 };
  if (authorId) {
    const rows = await BookAuthor.findAll({ where: { authorId: Number(authorId) }, attributes: ['bookId'] });
    where.id = { [Op.in]: rows.map((r) => r.bookId) };
  }
  return Book.findAll({ where, include: INCLUDE, order: [['title', 'ASC']] });
};

exports.findById = async (id) => {
  const book = await Book.findByPk(id, { include: INCLUDE });
  if (!book) throw new HttpError(404, 'Livro não encontrado.');
  return book;
};

exports.create = async (body) => {
  const data = pick(body, ['title', 'isbn', 'year', 'categoryId', 'totalCopies']);
  if (data.totalCopies === undefined) data.totalCopies = 1;
  data.availableCopies = data.totalCopies; 
  if (data.categoryId) await checkCategory(data.categoryId);
  const authorIds = body.authorIds === undefined ? [] : await checkAuthors(body.authorIds);

  const id = await sequelize.transaction(async (t) => {
    const book = await Book.create(data, { transaction: t });
    await book.setAuthors(authorIds, { transaction: t });
    return book.id;
  });
  return exports.findById(id);
};

exports.update = async (id, body) => {
  const book = await Book.findByPk(id);
  if (!book) throw new HttpError(404, 'Livro não encontrado.');

  const data = pick(body, ['title', 'isbn', 'year', 'categoryId', 'totalCopies']);
  if (data.categoryId) await checkCategory(data.categoryId);
  const authorIds = body.authorIds === undefined ? undefined : await checkAuthors(body.authorIds);

  if (data.totalCopies !== undefined && data.totalCopies !== null) {
    const diff = Number(data.totalCopies) - book.totalCopies;
    const newAvailable = book.availableCopies + diff;
    if (newAvailable < 0) {
      throw new HttpError(409, 'O total de exemplares não pode ser menor que a quantidade atualmente emprestada.');
    }
    data.availableCopies = newAvailable;
  }

  await sequelize.transaction(async (t) => {
    await book.update(data, { transaction: t });
    if (authorIds) await book.setAuthors(authorIds, { transaction: t });
  });
  return exports.findById(id);
};

exports.remove = async (id) => {
  const book = await Book.findByPk(id);
  if (!book) throw new HttpError(404, 'Livro não encontrado.');

  const active = await Loan.count({ where: { bookId: id, returnDate: null } });
  if (active > 0) {
    throw new HttpError(409, `Não é possível excluir o livro "${book.title}": há ${active} empréstimo(s) em aberto.`);
  }
  const history = await Loan.count({ where: { bookId: id } });
  if (history > 0) {
    throw new HttpError(409, `Não é possível excluir o livro "${book.title}": ele possui histórico de empréstimos.`);
  }
  await book.destroy(); 
};
