// var createHmac = require('./vendor/create-hmac')
// var CryptoJS = require('crypto-js')
var hmacSHA256 = require('crypto-js/hmac-sha256')
var hexer = require('./hexer')

module.exports = function hmac (key, string, encoding) {
  encoding = encoding
  var hash = hmacSHA256(string, key)
  var output = hash
  if (encoding === 'HEX') {
    output = output.toString(hexer)
  }
  return output
}

