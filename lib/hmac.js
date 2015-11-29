var createHmac = require('./vendor/create-hmac')

module.exports = function hmac (key, string, encoding) {
  return createHmac(key).update(string, 'utf8').digest(encoding)
}
