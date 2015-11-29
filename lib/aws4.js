var aws4 = exports
var hash = require('./hash')
var hmac = require('./hmac')
var querystring = require('querystring')

// http://docs.amazonwebservices.com/general/latest/gr/signature-version-4.html

function RequestSigner (request, credentials) {
  var headers = request.headers = (request.headers || {})

  this.request = request
  this.credentials = credentials

  this.service = request.service
  this.region = request.region

  // SES uses a different domain from the service name
  if (this.service === 'email') {
    this.service = 'ses'
  }

  headers.host = request.host
  request.hostname = request.host
}

RequestSigner.prototype.sign = function () {
  var request = this.request
  var headers = request.headers
  var query

  if (request.signQuery) {
    query = request.query

    if (this.credentials.sessionToken) {
      query['X-Amz-Security-Token'] = this.credentials.sessionToken
    }

    if (this.service === 's3' && !query['X-Amz-Expires']) {
      query['X-Amz-Expires'] = 86400
    }

    if (query['X-Amz-Date']) {
      this.datetime = query['X-Amz-Date']
    } else {
      query['X-Amz-Date'] = this.getDateTime()
    }

    query['X-Amz-Algorithm'] = 'AWS4-HMAC-SHA256'
    query['X-Amz-Credential'] = this.credentials.accessKeyId + '/' + this.credentialString()
    query['X-Amz-SignedHeaders'] = this.signedHeaders()

    request.path += '&X-Amz-Signature=' + this.signature()
  } else {
    if (!request.doNotModifyHeaders) {
      if (request.body && !headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8'
      }

      if (request.body && !headers['Content-Length'] && !headers['content-length']) {
        headers['Content-Length'] = Buffer.byteLength(request.body)
      }

      if (this.credentials.sessionToken) {
        headers['X-Amz-Security-Token'] = this.credentials.sessionToken
      }

      if (this.service === 's3') {
        headers['X-Amz-Content-Sha256'] = hash(this.request.body || '')
      }

      if (headers['X-Amz-Date']) {
        this.datetime = headers['X-Amz-Date']
      } else {
        headers['X-Amz-Date'] = this.getDateTime()
      }
    }

    delete headers.Authorization
    delete headers.authorization
    headers.Authorization = this.authHeader()
  }

  request.path += '?' + querystring.stringify(request.query)
  return request
}

RequestSigner.prototype.getDateTime = function () {
  if (!this.datetime) {
    var headers = this.request.headers
    var date = new Date(headers.Date || headers.date || new Date())

    this.datetime = date.toISOString().replace(/[:\-]|\.\d{3}/g, '')
  }
  return this.datetime
}

RequestSigner.prototype.getDate = function () {
  return this.getDateTime().substr(0, 8)
}

RequestSigner.prototype.authHeader = function () {
  return [
    'AWS4-HMAC-SHA256 Credential=' + this.credentials.accessKeyId + '/' + this.credentialString(),
    'SignedHeaders=' + this.signedHeaders(),
    'Signature=' + this.signature()
  ].join(', ')
}

RequestSigner.prototype.signature = function () {
  var date = this.getDate()
  var kDate = hmac('AWS4' + this.credentials.secretAccessKey, date)
  var kRegion = hmac(kDate, this.region)
  var kService = hmac(kRegion, this.service)
  var kCredentials = hmac(kService, 'aws4_request')
  return hmac(kCredentials, this.stringToSign(), 'hex')
}

RequestSigner.prototype.stringToSign = function () {
  return [
    'AWS4-HMAC-SHA256',
    this.getDateTime(),
    this.credentialString(),
    hash(this.canonicalString())
  ].join('\n')
}

RequestSigner.prototype.canonicalString = function () {
  var bodyHash
  if (this.service === 's3' && this.request.signQuery) {
    bodyHash = 'UNSIGNED-PAYLOAD'
  } else {
    bodyHash = hash(this.request.body || '', 'hex')
  }
  var queryStr = querystring.stringify(this.request.query)

  return [
    this.request.method.toUpperCase(),
    this.request.path,
    queryStr,
    this.canonicalHeaders() + '\n',
    this.signedHeaders(),
    bodyHash
  ].join('\n')
}

RequestSigner.prototype.canonicalHeaders = function () {
  var headers = this.request.headers
  function trimAll (header) {
    return header.toString().trim().replace(/\s+/g, ' ')
  }
  return Object.keys(headers)
    .sort(function (a, b) { return a.toLowerCase() < b.toLowerCase() ? -1 : 1 })
    .map(function (key) { return key.toLowerCase() + ':' + trimAll(headers[key]) })
    .join('\n')
}

RequestSigner.prototype.signedHeaders = function () {
  return Object.keys(this.request.headers)
    .map(function (key) { return key.toLowerCase() })
    .sort()
    .join(';')
}

RequestSigner.prototype.credentialString = function () {
  return [
    this.getDate(),
    this.region,
    this.service,
    'aws4_request'
  ].join('/')
}

aws4.RequestSigner = RequestSigner

aws4.sign = function (request, credentials) {
  return new RequestSigner(request, credentials).sign()
}
