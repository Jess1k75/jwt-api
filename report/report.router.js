const router = require('express').Router();
const controller = require('./report.controller');
const { authenticate, isAdmin } = require('../auth/auth.middleware');

router.get('/dashboard', authenticate, isAdmin, controller.dashboard);

module.exports = router;
