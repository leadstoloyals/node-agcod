const tape = require('tape')
const Client = require('../')

tape(`CC - Create and Cancel`, (t) => {
  const client = new Client()
  const amount = 1000
  const currencyCode = 'USD'

  const { sequentialId } = client.createGiftCard('NA', amount, currencyCode, (error, result) => {
    t.notOk(error, 'no error')

    t.equal(result.gcClaimCode.length > 0, true)
    t.equal(result.cardInfo.value.currencyCode, currencyCode)
    t.equal(result.cardInfo.value.amount, amount)
    t.equal(result.cardInfo.cardStatus, 'Fulfilled')
    t.equal(result.gcId.length > 0, true)
    t.equal(result.creationRequestId.slice(0,5), client.config.partnerId)
    t.equal(result.status, 'SUCCESS')

    console.log(`createGiftCard: ${JSON.stringify(result)} NOT PART OF RESPONSE TO AMAZON`)
    console.log(`CC-gcCreationRequestId, ${result.creationRequestId}`)
    console.log(`CC-gcId, ${result.gcId}`)
    console.log(`CC-claimCode, ${result.gcClaimCode}`)
    console.log(`CC-gcAmount, ${result.cardInfo.value.amount}`)

    client.cancelGiftCard('NA', sequentialId, result.gcId, (error, result) => {
      t.notOk(error, 'no error')
      t.ok(result, 'some result')
      console.log(`cancelGiftCard: ${JSON.stringify(result)}`)
      t.end()
    })
  })
})

tape(`DLB - Create request sanity check near discount's lower boundary - $0.01`, (t) => {
  const client = new Client()
  const amount = 0.01
  const currencyCode = 'USD'

  client.createGiftCard('NA', amount, currencyCode, (error, result) => {
    t.notOk(error, 'no error')

    t.equal(result.gcClaimCode.length > 0, true)
    t.equal(result.cardInfo.value.currencyCode, currencyCode)
    t.equal(result.cardInfo.value.amount, amount)
    t.equal(result.cardInfo.cardStatus, 'Fulfilled')
    t.equal(result.gcId.length > 0, true)
    t.equal(result.creationRequestId.slice(0,5), client.config.partnerId)
    t.equal(result.status, 'SUCCESS')

    console.log(`createGiftCard: ${JSON.stringify(result)} NOT PART OF RESPONSE TO AMAZON`)
    console.log(`DLB-gcCreationRequestId, ${result.creationRequestId}`)
    console.log(`DLB-gcId, ${result.gcId}`)
    console.log(`DLB-claimCode, ${result.gcClaimCode}`)
    console.log(`DLB-gcAmount, ${result.cardInfo.value.amount}`)

    t.end()
  })
})

tape(`MAX - Create request for the maximum allowable GC - $2000.00`, (t) => {
  const client = new Client()
  const amount = 2000
  const currencyCode = 'USD'

  client.createGiftCard('NA', amount, currencyCode, (error, result) => {
    t.notOk(error, 'no error')

    t.equal(result.gcClaimCode.length > 0, true)
    t.equal(result.cardInfo.value.currencyCode, currencyCode)
    t.equal(result.cardInfo.value.amount, amount)
    t.equal(result.cardInfo.cardStatus, 'Fulfilled')
    t.equal(result.gcId.length > 0, true)
    t.equal(result.creationRequestId.slice(0,5), client.config.partnerId)
    t.equal(result.status, 'SUCCESS')

    console.log(`createGiftCard: ${JSON.stringify(result)} NOT PART OF RESPONSE TO AMAZON`)
    console.log(`MAX-gcCreationRequestId, ${result.creationRequestId}`)
    console.log(`MAX-gcId, ${result.gcId}`)
    console.log(`MAX-claimCode, ${result.gcClaimCode}`)
    console.log(`MAX-gcAmount, ${result.cardInfo.value.amount}`)

    t.end()
  })
})

tape(`IDM - Create requests idempotency Check`, (t) => {
  const client = new Client()
  const amount = 1000
  const currencyCode = 'USD'

  const { sequentialId } = client.createGiftCard('NA', amount, currencyCode, (error, result) => {
    t.notOk(error, 'no error')

    t.equal(result.gcClaimCode.length > 0, true)
    t.equal(result.cardInfo.value.currencyCode, currencyCode)
    t.equal(result.cardInfo.value.amount, amount)
    t.equal(result.cardInfo.cardStatus, 'Fulfilled')
    t.equal(result.gcId.length > 0, true)
    t.equal(result.creationRequestId.slice(0,5), client.config.partnerId)
    t.equal(result.status, 'SUCCESS')

    console.log(`createGiftCard: ${JSON.stringify(result)} NOT PART OF RESPONSE TO AMAZON`)
    console.log(`IDM-gcCreationRequestId, ${result.creationRequestId}`)
    console.log(`IDM-claimCode, ${result.gcClaimCode}`)
    console.log(`IDM-gcAmount, ${result.cardInfo.value.amount} NOT PART OF RESPONSE TO AMAZON`)

    client.createGiftCardAgain('NA', amount, currencyCode, sequentialId, (error, result) => {
      t.notOk(error, 'no error')
      t.ok(result, 'some result')
      console.log(`createGiftCardAgain: ${JSON.stringify(result)} NOT PART OF RESPONSE TO AMAZON`)
      console.log(`IDM-returnedGCAmount, ${result.cardInfo.value.amount}`)

      t.end()
    })
  })
})
