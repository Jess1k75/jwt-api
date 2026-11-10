const { Author, BookAuthor } = require('../models');
const HttpError = require('../utils/httpError');
const { pick } = require('../utils/parse');

const FIELDS = ['name', 'nationality', 'birthDate'];

exports.list = () => Author.findAll({ order: [['name', 'ASC']] });

exports.findById = async (id) => {
  const author = await Author.findByPk(id);
  if (!author) throw new HttpError(404, 'Autor não encontrado.');
  return author;
};

exports.create = (body) => Author.create(pick(body, FIELDS));

exports.update = async (id, body) => {
  const author = await exports.findById(id);
  return author.update(pick(body, FIELDS));
};

exports.remove = async (id) => {
  const author = await exports.findById(id);
  const books = await BookAuthor.count({ where: { authorId: id } });
  if (books > 0) {
    throw new HttpError(409, `Não é possível excluir o autor "${author.name}": existem ${books} livro(s) vinculado(s).`);
  }
  await author.destroy();
};
