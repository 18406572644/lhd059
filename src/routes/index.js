const express = require('express');
const bottleRoutes = require('./bottleRoutes');
const replyRoutes = require('./replyRoutes');
const statsRoutes = require('./statsRoutes');

const router = express.Router();

router.use('/', bottleRoutes);
router.use('/', replyRoutes);
router.use('/', statsRoutes);

module.exports = router;
