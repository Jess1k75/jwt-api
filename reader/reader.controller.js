const service = require('./reader.service');
const loanService = require('../loan/loan.service');
const { parseId } = require('../utils/parse');

exports.list = async (req, res) => res.json(await service.list(req.query));
exports.get = async (req, res) => res.json(await service.findById(parseId(req.params.id)));
exports.create = async (req, res) => res.status(201).json(await service.create(req.body));
exports.update = async (req, res) => res.json(await service.update(parseId(req.params.id), req.body));

exports.loans = async (req, res) => {
  const id = parseId(req.params.id);
  await service.findById(id);
  res.json(await loanService.list({ readerId: id }));
};
