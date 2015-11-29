var createHash = require('./vendor/create-hash')

module.exports = function hash (string, encoding) {
  encoding = encoding || 'hex'
  return createHash().update(string, 'utf8').digest(encoding)
}
