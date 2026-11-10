const { Op } = require('sequelize');
const { sequelize, Loan, Book, Reader, User } = require('../models');
const HttpError = require('../utils/httpError');

const LOAN_DAYS = 7; 
const MAX_ACTIVE_LOANS = 3; 
const FINE_PER_DAY = 1.0; 
const DAY_MS = 24 * 60 * 60 * 1000;
const STATUSES = ['ATIVO', 'ATRASADO', 'DEVOLVIDO'];

const INCLUDE = [
  { model: Book, as: 'book', attributes: ['id', 'title', 'isbn'] },
  { model: Reader, as: 'reader', attributes: ['id', 'name', 'cpf'] },
  { model: User, as: 'attendant', attributes: ['id', 'name'] },
];

async function refreshOverdue(transaction) {
  await Loan.update(
    { status: 'ATRASADO' },
    { where: { returnDate: null, status: 'ATIVO', dueDate: { [Op.lt]: new Date() } }, transaction }
  );
}
exports.refreshOverdue = refreshOverdue;

exports.findById = async (id) => {
  const loan = await Loan.findByPk(id, { include: INCLUDE });
  if (!loan) throw new HttpError(404, 'Empréstimo não encontrado.');
  return loan;
};

exports.list = async ({ status, readerId } = {}) => {
  if (status && !STATUSES.includes(status)) {
    throw new HttpError(400, `Status inválido. Use: ${STATUSES.join(', ')}.`);
  }
  await refreshOverdue();
  const where = {};
  if (status) where.status = status;
  if (readerId) where.readerId = readerId;
  return Loan.findAll({ where, include: INCLUDE, order: [['loanDate', 'DESC']] });
};

exports.create = async ({ bookId, readerId }, userId) => {
  if (!bookId || !readerId) throw new HttpError(400, 'Informe bookId e readerId.');

  const loanId = await sequelize.transaction(async (t) => {
    await refreshOverdue(t);

    const reader = await Reader.findByPk(readerId, { transaction: t });
    if (!reader) throw new HttpError(404, 'Leitor não encontrado.');
    const book = await Book.findByPk(bookId, { transaction: t });
    if (!book) throw new HttpError(404, 'Livro não encontrado.');

    if (book.availableCopies <= 0) {
      throw new HttpError(409, `Não há exemplares disponíveis de "${book.title}".`);
    }

    const open = await Loan.findAll({ where: { readerId, returnDate: null }, transaction: t });
    if (open.some((l) => l.status === 'ATRASADO')) {
      throw new HttpError(409, 'O leitor possui empréstimo atrasado e não pode pegar novos livros.');
    }
    if (open.length >= MAX_ACTIVE_LOANS) {
      throw new HttpError(409, `O leitor já possui ${MAX_ACTIVE_LOANS} empréstimos ativos (limite máximo).`);
    }

    const loanDate = new Date();
    const dueDate = new Date(loanDate.getTime() + LOAN_DAYS * DAY_MS);
    const loan = await Loan.create(
      { loanDate, dueDate, status: 'ATIVO', fine: 0, bookId: book.id, readerId: reader.id, userId },
      { transaction: t }
    );
    await book.decrement('availableCopies', { by: 1, transaction: t });
    return loan.id;
  });

  return exports.findById(loanId);
};

exports.returnLoan = async (id) => {
  await sequelize.transaction(async (t) => {
    const loan = await Loan.findByPk(id, { transaction: t });
    if (!loan) throw new HttpError(404, 'Empréstimo não encontrado.');
    if (loan.returnDate) throw new HttpError(409, 'Este empréstimo já foi devolvido.');

    const now = new Date();
    let fine = 0;
    if (now > loan.dueDate) {
      const daysLate = Math.ceil((now - loan.dueDate) / DAY_MS);
      fine = daysLate * FINE_PER_DAY;
    }

    await loan.update({ returnDate: now, status: 'DEVOLVIDO', fine }, { transaction: t });
    await Book.increment('availableCopies', { by: 1, where: { id: loan.bookId }, transaction: t });
  });

  return exports.findById(id);
};
