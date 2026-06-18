const replyService = require('../services/ReplyService');

class ReplyController {
  async createReply(req, res) {
    const { bottleId, content, authorNickname, authorAvatar } = req.body;

    if (!bottleId) {
      return res.status(400).json({ error: '参数错误' });
    }

    const validation = replyService.validateReplyContent(content);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const result = replyService.createReply({
      bottleId,
      content,
      authorNickname,
      authorAvatar
    });

    if (!result.success) {
      return res.status(result.statusCode || 400).json({ error: result.error });
    }

    res.json(result.data);
  }
}

module.exports = new ReplyController();
