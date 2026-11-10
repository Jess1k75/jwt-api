const bcrypt = require('bcryptjs');
const { User } = require('./models');

module.exports = async function seedAdmin() {
  const admins = await User.count({ where: { isAdmin: true } });
  if (admins > 0) return;

  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@biblioteca.com').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || '123456';

  await User.create({
    name: process.env.SEED_ADMIN_NAME || 'Administrador',
    username: process.env.SEED_ADMIN_USERNAME || 'admin',
    email,
    password: await bcrypt.hash(password, 10),
    isAdmin: true,
    active: true,
  });
  console.log(`[seed] Admin criado: ${email} / ${password}`);
};
