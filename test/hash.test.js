var hash = require('../lib/hash')
var expect = require('code').expect
var Lab = require('lab')
var lab = exports.lab = Lab.script()

lab.experiment('hash', function () {
  lab.test('hashes input', function (done) {
    var OUTPUT_EXPECTED = 'af2bdbe1aa9b6ec1e2ade1d694f41fc71a831d0268e9891562113d8a62add1bf'
    var input = 'sample'
    var output = hash(input)
    expect(output).to.equal(OUTPUT_EXPECTED)
    done()
  })
})
