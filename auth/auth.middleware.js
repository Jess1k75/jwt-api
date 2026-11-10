const jwt = require('jsonwebtoken');

// Valida o access token. Token ausente, inválido ou expirado => 401
// (o front-end depende do 401 para saber que precisa renovar o token)
exports.authenticate = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Token não informado.' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (err) {
    const expired = err.name === 'TokenExpiredError';
    return res.status(401).json({ message: expired ? 'Token expirado.' : 'Token inválido.', expired });
  }
};

// Perfil: apenas administradores. Atendente => 403
exports.isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Acesso restrito a administradores.' });
  }
  return next();
};
