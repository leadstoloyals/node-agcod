const tape = require('tape')
const nock = require('nock')

const helpers = require('../lib/helpers')
const Client = require('../')
const config = require('config')

tape('authentication fails with wrong credentials', (t) => {
  const client = new Client(Object.assign(config, {
      credentials: {
        accessKeyId: 'fake-aws-key',
        secretAccessKey: 'fake-secret-key'
      }
    })
  )
 
  const {signedRequest} = client.createGiftCard('NA', 123, 'USD', (err, result) => {
    t.equal(result, undefined)
    t.end()
  })

  if (process.env.NODE_ENV === 'development') {
    nock(`https://${signedRequest.host}`)
    .post('/CreateGiftCard')
    .reply(403, {})
  }
})

tape('createGiftCard', (t) => {
  const client = new Client(config || {})
  const amount = 123
  const currencyCode = 'USD'

  const {sequentialId, signedRequest} = client.createGiftCard('NA', amount, currencyCode, (error, result) => {
    t.notOk(error, 'no error')
    t.equal(typeof result, 'object', 'result is an object')
    t.equal(typeof result.gcClaimCode, 'string', 'result.gcClaimCode is a string')
    t.equal(typeof result.cardInfo, 'object', 'result.cardInfo is an object')
    t.equal(typeof result.cardInfo.value, 'object', 'result.cardInfo.value is an object')
    t.equal(typeof result.cardInfo.value.currencyCode, 'string', 'result.cardInfo.value.currencyCode is a string')
    t.equal(typeof result.cardInfo.value.amount, 'number', 'result.cardInfo.value.amount is a number')
    t.equal(typeof result.cardInfo.cardStatus, 'string', 'result.cardInfo.cardStatus is a string')
    t.equal(typeof result.gcId, 'string', 'result.gcId is a string')
    t.equal(typeof result.creationRequestId, 'string', 'result.creationRequestId is a string')
    t.equal(result.gcExpirationDate, null, 'result.gcExpirationDate is null')
    t.equal(typeof result.status, 'string', 'result.status is a string')

    t.equal(result.gcClaimCode.length > 0, true)
    t.equal(result.cardInfo.value.currencyCode, currencyCode)
    t.equal(result.cardInfo.value.amount, amount)
    t.equal(result.cardInfo.cardStatus, 'Fulfilled')
    t.equal(result.gcId.length > 0, true)
    t.equal(result.creationRequestId.slice(0,5), client.config.partnerId)
    t.equal(result.status, 'SUCCESS')

    t.end()
    // {
    //   cardInfo: {
    //     cardNumber: null,
    //     cardStatus: 'Fulfilled',
    //     expirationDate: null,
    //     value: {
    //       amount: 123,
    //       currencyCode: 'USD'
    //     }
    //   },
    //   creationRequestId: 'A2c4E1234567',
    //   gcClaimCode: '23H3-HRQYNW-9JXV',
    //   gcExpirationDate: null,
    //   gcId: 'A1234567890BCD',
    //   status: 'SUCCESS'
    // }
  })


  if (process.env.NODE_ENV === 'development') {
    const responseBody = helpers.CreateGiftCardResponse(
      client.config.partnerId, sequentialId, amount, currencyCode
    )

    nock(`https://${signedRequest.host}`)
    .post('/CreateGiftCard')
    .reply(200, responseBody)
  }

})

tape('cancelGiftCard', (t) => {
  const client = new Client(config || {})
  const amount = 123
  const currencyCode = 'USD'

  const {sequentialId, signedRequest} = client.createGiftCard('NA', amount, currencyCode, (error, result) => {
    t.notOk(error, 'no error')

    t.equal(result.gcClaimCode.length > 0, true)
    t.equal(result.cardInfo.value.currencyCode, currencyCode)
    t.equal(result.cardInfo.value.amount, amount)
    t.equal(result.cardInfo.cardStatus, 'Fulfilled')
    t.equal(result.gcId.length > 0, true)
    t.equal(result.creationRequestId.slice(0,5), client.config.partnerId)
    t.equal(result.status, 'SUCCESS')

    if (process.env.NODE_ENV === 'development') {
      nock(`https://${signedRequest.host}`)
      .post('/CancelGiftCard')
      .reply(200, helpers.CancelGiftCardResponse(
        client.config.partnerId, sequentialId, result.gcId
      ))
    }

    client.cancelGiftCard('NA', sequentialId, result.gcId, (error, result) => {
      t.notOk(error, 'no error')
      t.ok(result, 'some result')
      t.end()
    })
  })


  if (process.env.NODE_ENV === 'development') {
    nock(`https://${signedRequest.host}`)
    .post('/CreateGiftCard')
    .reply(200, helpers.CreateGiftCardResponse(
      client.config.partnerId, sequentialId, amount, currencyCode
    ))
  }

})
