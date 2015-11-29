var https = require('https')
var aws4 = require('../lib/aws4')
var expect = require('code').expect
var Lab = require('lab')
var lab = exports.lab = Lab.script()

lab.experiment('sign', { only: false, timeout: 5000 }, function () {
  var accessKey = process.env.AWS_ACCESS_KEY
  var secret = process.env.AWS_SECRET_ACCESS_KEY
  lab.before(function (done) {
    if (!accessKey) {
      throw new Error('AWS_ACCESS_KEY environment variable must be set for test')
    }
    if (!secret) {
      throw new Error('AWS_SECRET_ACCESS_KEY environment variable must be set for test')
    }
    done()
  })

  lab.test('sqs', function (done) {
    var opts = {
      service: 'sqs',
      region: 'us-east-1',
      host: 'sqs.us-east-1.amazonaws.com',
      method: 'get',
      path: '/',
      query: {
        Action: 'ListQueues'
      }
    }

    var keys = {accessKeyId: accessKey, secretAccessKey: secret}
    aws4.sign(opts, keys)
    expect(opts).to.exist()
    validateRequest(opts, done)
  })

  lab.test('lambda', function (done) {
    var opts = {
      service: 'lambda',
      region: 'us-east-1',
      method: 'get',
      host: 'lambda.us-east-1.amazonaws.com',
      path: '/2014-11-13/functions/',
      query: {}
    }

    var keys = {accessKeyId: accessKey, secretAccessKey: secret}
    aws4.sign(opts, keys)
    expect(opts).to.exist()
    validateRequest(opts, done)
  })
})

function validateRequest (opts, callback) {
  https.request(opts, function (res) {
    var data = ''
    res.on('data', function (chunk) {
      data += chunk.toString('utf8')
    })
    res.on('end', function () {
      if (res.statusCode !== 200) {
        console.log(data)
      }
      expect(res.statusCode).to.equal(200)
      callback()
    })
  }).end()
}
