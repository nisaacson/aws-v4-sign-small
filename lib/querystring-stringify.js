var strictUriEncode = require('strict-uri-encode')
module.exports = function stringify (obj) {
  if (!obj) {
    return ''
  }
  return Object.keys(obj).sort().map(function (key) {
    var val = obj[key]

    if (val === undefined) {
      return ''
    }

    if (val === null) {
      return key
    }

    if (Array.isArray(val)) {
      return val.sort().map(function (val2) {
        return strictUriEncode(key) + '=' + strictUriEncode(val2)
      }).join('&')
    }

    return strictUriEncode(key) + '=' + strictUriEncode(val)
  }).filter(function (x) {
    return x.length > 0
  }).join('&')
}
