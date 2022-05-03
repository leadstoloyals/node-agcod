Node.js api gateway to the Amazon Giftcard On Demand Web service
============

## Install
`npm install agcod`

## Configuration

Create a directory `.agcod` in the root of your app, adding your credentials to files named with the expected values of `NODE_ENV` e.g. `.agcod/sandbox.json`.  Credentials look like this:
```json
{
  "partnerId": "A2c4E",
  "credentials": {
    "accessKeyId": "AKI12345678",
    "secretAccessKey": "qwertyQWERTY1234567QWERTYqwerty1234567"
  }
}
```
## Usage
```javascript
const Client = require('agcod')
// the client can be created a number of ways:
// 1. will use the NODE_ENV to look for a .json file in .agcod/
const client = new Client() 
// 2. may be given a file name containing credentials
const client = new Client('./sandbox.json')
// 3. explicitly passed a credentials object
const client = new Client({
  "partnerId": "A2c4E",
  "credentials": {
    "accessKeyId": "AKI12345678",
    "secretAccessKey": "qwertyQWERTY1234567QWERTYqwerty1234567"
  }
})

// now create a gift card, indicating the country for which
// to create it and the amount

client.createGiftCard('US', 100, (error, result) => {
  console.log('createGiftCard response', error, result)
})

// or use promises, a more modern approach

client.createGiftCard('US', 100).then(({res, signedRequest}) => {
  console.log('createGiftCard response', res)
  console.log('signed request', signedRequest) // useful for debugging purposes as this may be passed to curl
})

// an explicit currency may be passed but may be rejected by the system

client.createGiftCard('US', 100, 'GBP', (error, result) => {
  console.log('createGiftCard response', error, result)
})

// an explicit currency may be passed but may be rejected by the system

client.createGiftCard('US', 100, 'GBP', (error, result) => {
  console.log('client.createGiftCard response', error, result)
})

```
The above card creation will result in an object like:
```js
client.createGiftCard response null {
  cardInfo: {
    cardNumber: null,
    cardStatus: 'Fulfilled',
    expirationDate: null,
    value: { amount: 100, currencyCode: 'USD' }
  },
  creationRequestId: 'Lif132190216bqrq',
  gcClaimCode: '6X6M-PHKYAW-JMAY',
  gcExpirationDate: null,
  gcId: '1511461022170005',
  status: 'SUCCESS'
}
```
## Tests
During tests requests are intercepted by nock and responds with a desired response code and contents.
- https://davidwalsh.name/nock
- https://github.com/node-nock/nock

## Nota Bene
- This client needs to operate under TLS 1.2 or after June 30th, 2018 API requests will cease to work

## Other clients
For reference purposes, here's a list of resources that talk about agcod clients.
- https://github.com/larafale/agcod
- https://stackoverflow.com/questions/25007760/having-trouble-in-generating-amazon-aws-signature-with-php/25027843#25027843
- https://github.com/aws/aws-sdk-core-ruby/issues/113
- https://twitter.com/awsforphp/status/715337682096787457?lang=en
- https://forums.aws.amazon.com/thread.jspa?threadID=113404
