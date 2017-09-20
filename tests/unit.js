const tape = require('tape')
const Client = require('../')

tape('generated id\'s do not collide (probably)', (t) => {
  const client = new Client()

  let ids=[...Array(1e2)].map(()=>client._getNewId())

  t.equal(hasDuplicate(ids), false)
  t.end()
})

tape('_getCreateGiftCardRequestBody', (t) => {
  const partnerId = 'Test'
  const client = new Client({partnerId})
  const amount = 123
  const currencyCode = 'USD'
  const actual = client._getCreateGiftCardRequestBody('001', amount, currencyCode)
  t.deepEqual(actual, {
    creationRequestId: `${partnerId}001`,
    partnerId,
    value: { amount, currencyCode }
  })
  t.end()
})

tape('_getCancelGiftCardRequestBody', (t) => {
  const partnerId = 'Test'
  const client = new Client({partnerId})
  const gcId = 'xyz'
  const actual = client._getCancelGiftCardRequestBody('001', gcId)
  t.deepEqual(actual, {
    creationRequestId: `${partnerId}001`,
    partnerId,
    gcId
  })
  t.end()
})

tape('_checkRegion', (t) => {
  const client = new Client()
  const amount = 123
  const currencyCode = 'USD'

  t.plan(4)
  t.throws(() => client._checkRegion('XX', amount, currencyCode, () => {}))
  t.doesNotThrow(() => client._checkRegion('NA', amount, currencyCode, () => {}))
  t.doesNotThrow(() => client._checkRegion('EU', amount, currencyCode, () => {}))
  t.doesNotThrow(() => client._checkRegion('FE', amount, currencyCode, () => {}))
  t.end()
})

tape('_getSignedRequest', (t) => {
  const partnerId = 'Test'
  const client = new Client({
    partnerId,
    credentials: {
      accessKeyId: 'fake-aws-key',
      secretAccessKey: 'fake-secret-key',
    },
    extraHeaders: {
      'x-amz-date': '20170918T133138Z'
    }
  })
  const amount = 123
  const currencyCode = 'USD'
  const requestBody = client._getCreateGiftCardRequestBody('001', amount, currencyCode)
  const signedRequest = client._getSignedRequest('NA', 'CreateGiftCard', requestBody)

  t.equal(typeof signedRequest, 'object', 'signedRequest is an object')
  t.equal(signedRequest.region, 'us-east-1')
  t.equal(signedRequest.host, process.env.NODE_ENV === 'production' ? 'agcod-v2.amazon.com' : 'agcod-v2-gamma.amazon.com', `signedRequest.host in ${process.env.NODE_ENV} is correct`)
  t.equal(signedRequest.path, '/CreateGiftCard')
  t.equal(signedRequest.body, JSON.stringify(requestBody), 'signedRequest.body is correct')
  t.equal(signedRequest.service, 'AGCODService')
  t.equal(signedRequest.headers['accept'], 'application/json')
  t.equal(signedRequest.headers['content-type'], 'application/json')
  t.equal(signedRequest.headers['x-amz-target'], 'com.amazonaws.agcod.AGCODService.CreateGiftCard')
  t.equal(signedRequest.headers['x-amz-date'], '20170918T133138Z')
  t.equal(signedRequest.headers['Host'], process.env.NODE_ENV === 'production' ? 'agcod-v2.amazon.com' : 'agcod-v2-gamma.amazon.com', `signedRequest.host in ${process.env.NODE_ENV} is correct`)
  t.equal(signedRequest.headers['Content-Length'], 94)
  t.equal(signedRequest.headers['Authorization'], [
    'AWS4-HMAC-SHA256',
    'Credential=fake-aws-key/20170918/us-east-1/AGCODService/aws4_request,',
    'SignedHeaders=accept;content-length;content-type;host;x-amz-date;x-amz-target,',
    'Signature=e9d5479b216d39a2dd949f5971383c871ab420a6c6b3380f98e9851a8349e260'
  ].join(' '))
  t.equal(signedRequest.method, 'POST')
  t.equal(signedRequest.securityOptions, 'SSL_OP_NO_SSLv3')

  t.end()
})

const hasDuplicate = (arr) => {
  let hash = {}
  let hasDuplicate = false
   arr.forEach((val) => {
     if (hash[val]) {
       hasDuplicate = true
       return
     }
     hash[val] = true
  })
  return hasDuplicate
}
