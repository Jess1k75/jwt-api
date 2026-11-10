const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { RefreshToken } = require('../models');
const userService = require('../user/user.service');
const HttpError = require('../utils/httpError');

const REFRESH_DAYS = 7;

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );
}

async function createRefreshToken(user) {
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
  // jti aleatório garante que dois tokens do mesmo usuário nunca sejam iguais
  const token = jwt.sign({ id: user.id, jti: crypto.randomUUID() }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: `${REFRESH_DAYS}d`,
  });
  await RefreshToken.create({ token, userId: user.id, expiresAt });
  return token;
}

async function issueTokens(user) {
  return { accessToken: signAccessToken(user), refreshToken: await createRefreshToken(user) };
}

exports.login = async (email, password) => {
  if (!email || !password) throw new HttpError(400, 'Informe e-mail e senha.');

  // 1) verifica se o usuário existe ANTES de comparar a senha (correção do bug do login)
  const user = await userService.findByEmail(email);
  if (!user) throw new HttpError(401, 'E-mail ou senha inválidos.');

  const isMatch = await bcrypt.compare(String(password), user.password);
  if (!isMatch) throw new HttpError(401, 'E-mail ou senha inválidos.');

  // 2) atendente desativado não faz login
  if (!user.active) throw new HttpError(403, 'Usuário desativado. Procure um administrador.');

  const tokens = await issueTokens(user);
  const { password: _omit, ...safeUser } = user.toJSON();
  return { ...tokens, user: safeUser };
};

exports.refresh = async (refreshToken) => {
  if (!refreshToken) throw new HttpError(400, 'Informe o refreshToken.');

  try {
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new HttpError(401, 'Refresh token inválido ou expirado.');
  }

  const record = await RefreshToken.findOne({ where: { token: refreshToken } });
  if (!record) throw new HttpError(401, 'Refresh token não reconhecido.');

  // Reuso de um token já revogado = possível roubo: derruba todas as sessões do usuário
  if (record.revoked) {
    await RefreshToken.update({ revoked: true }, { where: { userId: record.userId } });
    throw new HttpError(401, 'Refresh token reutilizado. Todas as sessões foram encerradas, faça login novamente.');
  }

  if (record.expiresAt < new Date()) throw new HttpError(401, 'Refresh token expirado.');

  let user;
  try {
    user = await userService.findById(record.userId);
  } catch (e) {
    throw new HttpError(401, 'Usuário não encontrado.');
  }
  if (!user.active) throw new HttpError(401, 'Usuário desativado.');

  // Rotação: revoga o antigo e devolve um par novo
  await record.update({ revoked: true });
  return issueTokens(user);
};

exports.logout = async (refreshToken) => {
  if (!refreshToken) throw new HttpError(400, 'Informe o refreshToken.');
  await RefreshToken.update({ revoked: true }, { where: { token: refreshToken } });
  return { message: 'Logout realizado com sucesso.' };
};

exports.me = (userId) => userService.findById(userId);
