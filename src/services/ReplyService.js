const replyRepository = require('../repositories/ReplyRepository');
const bottleRepository = require('../repositories/BottleRepository');

class ReplyService {
  createReply({ bottleId, content, authorNickname, authorAvatar }) {
    const bottle = bottleRepository.findById(bottleId);
    if (!bottle) {
      return { success: false, error: '瓶子不存在', statusCode: 404 };
    }

    const now = new Date().toISOString();
    const result = replyRepository.create({
      bottleId,
      content: content.trim(),
      authorNickname,
      authorAvatar,
      createdAt: now
    });

    return {
      success: true,
      data: {
        id: result.lastInsertRowid,
        bottle_id: bottleId,
        content: content.trim(),
        author_nickname: authorNickname || null,
        author_avatar: authorAvatar || null,
        created_at: now
      }
    };
  }

  validateReplyContent(content) {
    if (!content || content.trim().length === 0) {
      return { valid: false, error: '参数错误' };
    }
    if (content.length > 50) {
      return { valid: false, error: '回信不能超过50字' };
    }
    return { valid: true };
  }
}

module.exports = new ReplyService();
