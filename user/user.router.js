const router = require('express').Router();
const controller = require('./user.controller');
const { authenticate, isAdmin } = require('../auth/auth.middleware');

// Tudo em /v1/user é exclusivo de administrador
router.use(authenticate, isAdmin);

router.get('/', controller.list);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.patch('/:id/active', controller.setActive);

module.exports = router;
