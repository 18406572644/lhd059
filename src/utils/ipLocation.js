const path = require('path');
const IP2Region = require('ip2region').default;

const ip2region = new IP2Region({
  ipv4db: path.join(__dirname, '..', '..', 'node_modules/ip2region/data/ip2region.db'),
  disableIpv6: true
});

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = forwardedFor.split(',');
    return ips[0].trim();
  }
  let ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  return ip;
}

function normalizeCityName(city) {
  if (!city) return null;
  city = city.trim();
  city = city.replace(/^(中国)/, '');
  city = city.replace(/(省|市|自治区|特别行政区|壮族|回族|维吾尔)$/, '');
  if (city.length >= 3) {
    const prefixes = ['内蒙古', '黑龙江'];
    for (const p of prefixes) {
      if (city.startsWith(p)) return p;
    }
  }
  return city.trim() || null;
}

function getCityByIp(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    return null;
  }
  try {
    const result = ip2region.search(ip);
    if (result) {
      const city = normalizeCityName(result.city);
      if (city) return city;
      const province = normalizeCityName(result.province);
      if (province) return province;
      const country = result.country && result.country !== '0' ? result.country : null;
      if (country) return country;
    }
  } catch (e) {
    console.warn('IP定位失败:', ip, e.message);
  }
  return null;
}

module.exports = { getClientIp, getCityByIp };
