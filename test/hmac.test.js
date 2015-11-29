var hmac = require('../lib/hmac')
var expect = require('code').expect
var Lab = require('lab')
var lab = exports.lab = Lab.script()

lab.experiment('hmac', function () {
  lab.test('returns hmac for input and key', function (done) {
    var OUTPUT_EXPECTED = 'eefccc4d760eeb2c1d056044c1eb2733c9aecf7431e972f35f5715e9d29308a1'
    var input = 'sample'
    var key = 'secret'
    var output = hmac(key, input, 'HEX')
    expect(output).to.equal(OUTPUT_EXPECTED)
    done()
  })
})
