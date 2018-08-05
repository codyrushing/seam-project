const xss = require('xss');

module.exports = (obj={}) => {
  const r = {};
  Object.keys(obj).forEach(
    key => r[key] = xss(obj[key])
  );
  return r;
}
