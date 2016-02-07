var aws4 = exports
var hash = require('./hash')
var hmac = require('./hmac')
var byteLength = require('./byte-length')
var querystringStringify = require('./querystring-stringify')

// http://docs.amazonwebservices.com/general/latest/gr/signature-version-4.html
var amazonHeaders = {
  date: 'X-Amz-Date',
  expires: 'X-AMZ-Expires',
  algo: 'X-Amz-Algorithm',
  credential: 'X-Amz-Credential',
  signed: 'X-Amz-SignedHeaders',
  signature: 'X-Amz-Signature',
  securityToken: 'X-Amz-Security-Token',
  contentSha256: 'X-Amz-Content-Sha256'
}

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
      query[amazonHeaders.securityToken] = this.credentials.sessionToken
    }

    if (this.service === 's3' && !query[headers.expires]) {
      query[amazonHeaders.expires] = 86400
    }

    if (query[amazonHeaders.date]) {
      this.datetime = query[amazonHeaders.date]
    } else {
      query[amazonHeaders.date] = getDateTime.call(this)
    }

    query[amazonHeaders.algo] = 'AWS4-HMAC-SHA256'
    query[amazonHeaders.credential] = this.credentials.accessKeyId + '/' + credentialString.call(this)
    query[amazonHeaders.signed] = signedHeaders.call(this)

    request.path += '&' + amazonHeaders.signature + '=' + signature.call(this)
  } else {
    if (!request.doNotModifyHeaders) {
      if (request.body && !headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8'
      }

      if (request.body && !headers['Content-Length'] && !headers['content-length']) {
        headers['Content-Length'] = byteLength(request.body)
      }

      if (this.credentials.sessionToken) {
        headers[amazonHeaders.securityToken] = this.credentials.sessionToken
      }

      if (this.service === 's3') {
        headers[amazonheaders.contentSha256] = hash(this.request.body || '')
      }

      if (headers[amazonHeaders.date]) {
        this.datetime = headers[amazonHeaders.date]
      } else {
        headers[amazonHeaders.date] = getDateTime.call(this)
      }
    }

    delete headers.Authorization
    delete headers.authorization
    headers.Authorization = authHeader.call(this)
  }

  request.path += '?' + querystringStringify(request.query)
  return request
}

function getDateTime () {
  if (!this.datetime) {
    var headers = this.request.headers
    var date = new Date(headers.Date || headers.date || new Date())

    this.datetime = date.toISOString().replace(/[:\-]|\.\d{3}/g, '')
  }
  return this.datetime
}

function getDate () {
  return getDateTime.call(this).substr(0, 8)
}

function authHeader () {
  return [
    'AWS4-HMAC-SHA256 Credential=' + this.credentials.accessKeyId + '/' + credentialString.call(this),
    'SignedHeaders=' + signedHeaders.call(this),
    'Signature=' + signature.call(this)
  ].join(', ')
}

function signature () {
  var date = getDate.call(this)
  var kDate = hmac('AWS4' + this.credentials.secretAccessKey, date)
  var kRegion = hmac(kDate, this.region)
  var kService = hmac(kRegion, this.service)
  var kCredentials = hmac(kService, 'aws4_request')
  return hmac(kCredentials, stringToSign.call(this), 'hex')
}

function stringToSign () {
  return [
    'AWS4-HMAC-SHA256',
    getDateTime.call(this),
    credentialString.call(this),
    hash(canonicalString.call(this))
  ].join('\n')
}

function canonicalString () {
  var bodyHash
  if (this.service === 's3' && this.request.signQuery) {
    bodyHash = 'UNSIGNED-PAYLOAD'
  } else {
    bodyHash = hash(this.request.body || '', 'hex')
  }
  var queryStr = querystringStringify(this.request.query)

  return [
    this.request.method.toUpperCase(),
    this.request.path,
    queryStr,
    canonicalHeaders.call(this) + '\n',
    signedHeaders.call(this),
    bodyHash
  ].join('\n')
}

function canonicalHeaders () {
  var headers = this.request.headers
  function trimAll (header) {
    return header.toString().trim().replace(/\s+/g, ' ')
  }
  return Object.keys(headers)
    .sort(function (a, b) { return a.toLowerCase() < b.toLowerCase() ? -1 : 1 })
    .map(function (key) { return key.toLowerCase() + ':' + trimAll(headers[key]) })
    .join('\n')
}

function signedHeaders () {
  return Object.keys(this.request.headers)
    .map(function (key) { return key.toLowerCase() })
    .sort()
    .join(';')
}

function credentialString () {
  return [
    getDate.call(this),
    this.region,
    this.service,
    'aws4_request'
  ].join('/')
}

aws4.RequestSigner = RequestSigner

aws4.sign = function (request, credentials) {
  return new RequestSigner(request, credentials).sign()
}
