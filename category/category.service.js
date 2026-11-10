const { Category, Book } = require('../models');
const HttpError = require('../utils/httpError');
const { pick } = require('../utils/parse');

exports.list = () => Category.findAll({ order: [['name', 'ASC']] });

exports.findById = async (id) => {
  const category = await Category.findByPk(id);
  if (!category) throw new HttpError(404, 'Categoria não encontrada.');
  return category;
};

exports.create = (body) => Category.create(pick(body, ['name', 'description']));

exports.update = async (id, body) => {
  const category = await exports.findById(id);
  return category.update(pick(body, ['name', 'description']));
};

exports.remove = async (id) => {
  const category = await exports.findById(id);
  const books = await Book.count({ where: { categoryId: id } });
  if (books > 0) {
    throw new HttpError(409, `Não é possível excluir a categoria "${category.name}": existem ${books} livro(s) vinculado(s).`);
  }
  await category.destroy();
};
