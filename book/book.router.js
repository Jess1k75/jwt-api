const router = require('express').Router();
const controller = require('./book.controller');
const { authenticate, isAdmin } = require('../auth/auth.middleware');

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.get);
router.post('/', isAdmin, controller.create);
router.put('/:id', isAdmin, controller.update);
router.delete('/:id', isAdmin, controller.remove);

module.exports = router;
