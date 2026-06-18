const express = require('express');
const bottleController = require('../controllers/BottleController');

const router = express.Router();

router.post('/throw', (req, res) => bottleController.throwBottle(req, res));
router.get('/fish', (req, res) => bottleController.fishBottle(req, res));
router.get('/bottle/:id', (req, res) => bottleController.getBottleDetail(req, res));
router.get('/bottles', (req, res) => bottleController.listFloatingBottles(req, res));

module.exports = router;
