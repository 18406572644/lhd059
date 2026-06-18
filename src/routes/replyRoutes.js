const express = require('express');
const replyController = require('../controllers/ReplyController');

const router = express.Router();

router.post('/reply', (req, res) => replyController.createReply(req, res));

module.exports = router;
