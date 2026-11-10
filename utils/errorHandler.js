const HttpError = require('./httpError');

// Middleware final: transforma qualquer erro em JSON { message }
// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  if (err instanceof HttpError) {
    const body = { message: err.message };
    if (err.details) body.details = err.details;
    return res.status(err.status).json(body);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const fields = err.errors.map((e) => e.path).join(', ');
    return res.status(409).json({ message: `Já existe um registro com esse valor (${fields}).` });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: err.errors.map((e) => e.message).join(' '),
      details: err.errors.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(409).json({ message: 'Operação inválida: referência inexistente ou registro com vínculos.' });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON inválido no corpo da requisição.' });
  }

  console.error(err);
  return res.status(500).json({ message: 'Erro interno do servidor.' });
};
