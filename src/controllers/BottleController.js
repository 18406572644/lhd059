const bottleService = require('../services/BottleService');
const { getClientIp, getCityByIp } = require('../utils/ipLocation');

class BottleController {
  async throwBottle(req, res) {
    const { content, color, authorNickname, authorAvatar } = req.body;

    const validation = bottleService.validateThrowContent(content);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const clientIp = getClientIp(req);
    const throwCity = getCityByIp(clientIp);

    const result = bottleService.throwBottle({
      content,
      color,
      authorNickname,
      authorAvatar,
      throwCity
    });

    res.json(result);
  }

  async fishBottle(req, res) {
    const clientIp = getClientIp(req);
    const fishedCity = getCityByIp(clientIp);

    const result = bottleService.fishBottle({ fishedCity });

    if (result === null) {
      return res.json(null);
    }

    res.json(result);
  }

  async getBottleDetail(req, res) {
    const { id } = req.params;

    const result = bottleService.getBottleDetail(id);

    if (result === null) {
      return res.status(404).json({ error: '瓶子不存在' });
    }

    res.json(result);
  }

  async listFloatingBottles(req, res) {
    const result = bottleService.listFloatingBottles(10);
    res.json(result);
  }
}

module.exports = new BottleController();
