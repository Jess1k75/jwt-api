const required = (label) => ({
  notNull: { msg: `${label} é obrigatório.` },
  notEmpty: { msg: `${label} é obrigatório.` },
});

module.exports = { required };
