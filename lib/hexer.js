module.exports = {
  stringify: hexStringify
}

function hexStringify (wordArray) {
// Shortcuts
  var words = wordArray.words
  var sigBytes = wordArray.sigBytes

  // Convert
  var hexChars = []
  for (var i = 0; i < sigBytes; i++) {
    var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
    hexChars.push((bite >>> 4).toString(16))
    hexChars.push((bite & 0x0f).toString(16))
  }
  return hexChars.join('')
}
