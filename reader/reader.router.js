const router = require('express').Router();
const controller = require('./reader.controller');
const { authenticate } = require('../auth/auth.middleware');

router.use(authenticate);

router.get('/', controller.list);
router.post('/', controller.create);
router.get('/:id', controller.get);
router.put('/:id', controller.update);
router.get('/:id/loans', controller.loans);

module.exports = router;
