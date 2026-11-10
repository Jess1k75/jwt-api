const service = require('./user.service');
const HttpError = require('../utils/httpError');
const { parseId } = require('../utils/parse');

exports.list = async (req, res) => res.json(await service.list());

exports.create = async (req, res) => res.status(201).json(await service.create(req.body ?? {}));

exports.update = async (req, res) => {
  const id = parseId(req.params.id);
  const body = req.body ?? {};
  if (id === req.user.id && body.isAdmin === false) {
    throw new HttpError(409, 'Você não pode remover seu próprio perfil de administrador.');
  }
  res.json(await service.update(id, body));
};

exports.setActive = async (req, res) => {
  const id = parseId(req.params.id);
  const { active } = req.body ?? {};
  if (id === req.user.id && active === false) {
    throw new HttpError(409, 'Você não pode desativar o seu próprio usuário.');
  }
  res.json(await service.setActive(id, active));
};
