const { Book, Loan, Reader } = require('../models');
const loanService = require('../loan/loan.service');

exports.dashboard = async () => {
  await loanService.refreshOverdue();

  const [totalBooks, totalCopies, availableCopies, activeLoans, overdueLoans, totalFines, totalReaders] =
    await Promise.all([
      Book.count(),
      Book.sum('totalCopies'),
      Book.sum('availableCopies'),
      Loan.count({ where: { returnDate: null } }),
      Loan.count({ where: { status: 'ATRASADO' } }),
      Loan.sum('fine'),
      Reader.count(),
    ]);

  return {
    totalBooks,
    totalCopies: totalCopies || 0,
    availableCopies: availableCopies || 0,
    activeLoans,
    overdueLoans,
    totalFines: Number(totalFines || 0),
    totalReaders,
  };
};
