const router = require('express').Router();
const controller = require('./auth.controller');
const { authenticate } = require('./auth.middleware');

router.post('/login', controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);
router.get('/me', authenticate, controller.me);

module.exports = router;
