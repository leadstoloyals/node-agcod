Node.js api gateway to the Amazon Giftcard On Demand Web service
============

## Install
`npm install agcod`

## Configuration

Create a directory `config` in the root of your app. And add a `development.json`, `sandbox.json` and `production.json` in it that looks like `config/example.json` in this repo.

## Usage
```javascript
const Client = require('agcod')
const client = new Client()

client.createGiftCard('NA', 123, 'USD', (error, result) => {
  console.log('client.createGiftCard response', error, result)
})
```

## Tests
During tests requests are intercepted by nock and responds with a desired response code and contents.
- https://davidwalsh.name/nock
- https://github.com/node-nock/nock

## Other clients
- https://github.com/john9hoff/amazon-gc
