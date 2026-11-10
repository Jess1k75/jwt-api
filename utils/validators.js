// Mensagens claras para campos obrigatórios do Sequelize
const required = (label) => ({
  notNull: { msg: `${label} é obrigatório.` },
  notEmpty: { msg: `${label} é obrigatório.` },
});

module.exports = { required };
