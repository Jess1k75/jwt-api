// Uso (só para a DEMONSTRAÇÃO em vídeo):
//   npm run atrasar -- <idDoEmprestimo> [diasDeAtraso]
// Deixa o empréstimo vencido há N dias (padrão 3) para você mostrar a multa na devolução.
require('dotenv').config();
const { sequelize, Loan } = require('../models');

(async () => {
  const [id, daysArg] = process.argv.slice(2);
  const days = Number(daysArg || 3);
  if (!id || !Number.isFinite(days) || days < 1) {
    console.log('Uso: npm run atrasar -- <idDoEmprestimo> [diasDeAtraso]');
    process.exit(1);
  }
  const loan = await Loan.findByPk(id);
  if (!loan || loan.returnDate) {
    console.log('Empréstimo não encontrado ou já devolvido.');
    process.exit(1);
  }
  const DAY = 24 * 60 * 60 * 1000;
  loan.dueDate = new Date(Date.now() - (days * DAY - 60 * 60 * 1000)); // vence há "days" dias (folga de 1h)
  loan.loanDate = new Date(loan.dueDate.getTime() - 7 * DAY);
  loan.status = 'ATRASADO';
  await loan.save();
  console.log(`Empréstimo ${id} agora vence há ${days} dia(s). Devolvendo agora, a multa será de R$ ${days},00.`);
  await sequelize.close();
})();
