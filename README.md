# aws-v4-sign-small

Size optimized library to perform AWS V4 request signing designed for use in the browser

# Usage

```
npm install --save- aws-v4-sign-small
```

# Usage

## via browserify/require

```js
var aws4 = require('aws-v4-sign-small')
var opts = {
  host: 'sqs.us-east-1.amazonaws.com',
  path: '/'
  query: '?Action=ListQueues'
}

var keys = {accessKeyId: 'access_key_here', secretAccessKey: 'secret_here'}
aws4.sign(opts, keys)
console.log('signed options: ', opts)
```

## globally in browser

```js
<script src="dist/aws-v4-sign-small.min.js"></script>
<script>
var aws4 = require('aws-v4-sign-small')
var opts = {
  host: 'sqs.us-east-1.amazonaws.com',
  path: '/'
  query: '?Action=ListQueues'
}

var keys = {accessKeyId: 'access_key_here', secretAccessKey: 'secret_here'}
aws4.sign(opts, keys)
console.log('signed options: ', opts)
</script>
```

# Testing

```sh
AWS_ACCESS_KEY=access_key_here AWS_SECRET_ACCESS_KEY=secret_here npm run test
```
