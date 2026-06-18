const express = require('express');
const statsController = require('../controllers/StatsController');

const router = express.Router();

router.get('/stats', (req, res) => statsController.getStats(req, res));

module.exports = router;
