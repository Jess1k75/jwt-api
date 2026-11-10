const service = require('./report.service');

exports.dashboard = async (req, res) => res.json(await service.dashboard());
