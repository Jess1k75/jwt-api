const service = require('./loan.service');
const { parseId } = require('../utils/parse');

exports.list = async (req, res) => res.json(await service.list({ status: req.query.status }));
exports.create = async (req, res) => res.status(201).json(await service.create(req.body ?? {}, req.user.id));
exports.returnLoan = async (req, res) => res.json(await service.returnLoan(parseId(req.params.id)));
