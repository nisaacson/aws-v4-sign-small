var sha256 = require('crypto-js/sha256')
var hexer = require('./hexer')

module.exports = function hash (string) {
  var hash = sha256(string)
  var output = hash.toString(hexer)
  return output
}
