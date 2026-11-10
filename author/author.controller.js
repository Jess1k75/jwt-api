const service = require('./author.service');
const { parseId } = require('../utils/parse');

exports.list = async (req, res) => res.json(await service.list());
exports.get = async (req, res) => res.json(await service.findById(parseId(req.params.id)));
exports.create = async (req, res) => res.status(201).json(await service.create(req.body));
exports.update = async (req, res) => res.json(await service.update(parseId(req.params.id), req.body));
exports.remove = async (req, res) => {
  await service.remove(parseId(req.params.id));
  res.status(204).end();
};
