const router = require('express').Router();
const controller = require('./loan.controller');
const { authenticate } = require('../auth/auth.middleware');

router.use(authenticate);

router.get('/', controller.list); 
router.post('/', controller.create);
router.patch('/:id/return', controller.returnLoan);

module.exports = router;
