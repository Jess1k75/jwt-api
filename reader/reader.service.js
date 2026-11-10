const { Op } = require('sequelize');
const { Reader } = require('../models');
const HttpError = require('../utils/httpError');
const { pick } = require('../utils/parse');

const FIELDS = ['name', 'cpf', 'email', 'phone'];

exports.list = ({ search } = {}) => {
  const where = {};
  if (search) {
    const digits = String(search).replace(/\D/g, '');
    where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }];
    if (digits) where[Op.or].push({ cpf: { [Op.like]: `%${digits}%` } });
  }
  return Reader.findAll({ where, order: [['name', 'ASC']] });
};

exports.findById = async (id) => {
  const reader = await Reader.findByPk(id);
  if (!reader) throw new HttpError(404, 'Leitor não encontrado.');
  return reader;
};

exports.create = (body) => Reader.create(pick(body, FIELDS));

exports.update = async (id, body) => {
  const reader = await exports.findById(id);
  return reader.update(pick(body, FIELDS));
};
