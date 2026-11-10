const service = require('./auth.service');

exports.login = async (req, res) => {
  const { email, password } = req.body ?? {};
  res.json(await service.login(email, password));
};

exports.refresh = async (req, res) => {
  res.json(await service.refresh((req.body ?? {}).refreshToken));
};

exports.logout = async (req, res) => {
  res.json(await service.logout((req.body ?? {}).refreshToken));
};

exports.me = async (req, res) => {
  res.json(await service.me(req.user.id));
};
