const bcrypt = require('bcryptjs');
const { User, RefreshToken } = require('../models');
const HttpError = require('../utils/httpError');
const { pick } = require('../utils/parse');

const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : email);

exports.list = () => User.findAll({ order: [['name', 'ASC']] });

exports.findById = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new HttpError(404, 'Atendente não encontrado.');
  return user;
};

exports.findByEmail = (email) => User.unscoped().findOne({ where: { email: normalizeEmail(email) || '' } });

async function hashPassword(password) {
  if (!password || String(password).length < 6) {
    throw new HttpError(400, 'A senha deve ter pelo menos 6 caracteres.');
  }
  return bcrypt.hash(String(password), 10);
}

exports.create = async (body) => {
  const data = pick(body, ['name', 'username', 'email']);
  data.email = normalizeEmail(data.email);
  data.password = await hashPassword(body.password);
  data.isAdmin = body.isAdmin === true || body.isAdmin === 'true';
  const user = await User.create(data);
  return User.findByPk(user.id);
};

exports.update = async (id, body) => {
  const user = await exports.findById(id);
  const data = pick(body, ['name', 'username', 'email']);
  if (data.email) data.email = normalizeEmail(data.email);
  if (body.isAdmin !== undefined) data.isAdmin = body.isAdmin === true || body.isAdmin === 'true';
  if (body.password) data.password = await hashPassword(body.password);
  await user.update(data);
  return User.findByPk(id);
};

exports.setActive = async (id, active) => {
  if (typeof active !== 'boolean') throw new HttpError(400, 'Informe "active" como true ou false.');
  const user = await exports.findById(id);
  await user.update({ active });

  if (!active) await RefreshToken.update({ revoked: true }, { where: { userId: id } });
  return User.findByPk(id);
};
