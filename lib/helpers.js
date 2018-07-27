const roundAmount = (amount) => Math.round(amount * 100) / 100

module.exports.CreateGiftCardRequest = (partnerId, sequentialId, amount, currencyCode, externalReference) =>
({
  creationRequestId: `${partnerId}${sequentialId}`,
  partnerId,
  value: {
    amount: roundAmount(amount),
    currencyCode, externalReference
  }
})

module.exports.CreateGiftCardResponse = (partnerId, sequentialId, amount, currencyCode) =>
({
  cardInfo: {
    cardNumber: null,
    cardStatus: "Fulfilled",
    expirationDate: null,
    value: {
        amount: roundAmount(amount),
        currencyCode
    }
  },
  creationRequestId: `${partnerId}${sequentialId}`,
  gcClaimCode: "3T42-DGTTRJ-GATB",
  gcExpirationDate: null,
  gcId: "A1VDBH5NED3H0L",
  status: "SUCCESS"
})

module.exports.CancelGiftCardRequest = (partnerId, sequentialId, gcId) =>
({
  creationRequestId: `${partnerId}${sequentialId}`,
  partnerId,
  gcId
})

module.exports.CancelGiftCardResponse = (partnerId, sequentialId, gcId) =>
({
  creationRequestId: `${partnerId}${sequentialId}`,
  gcId,
  status: "SUCCESS"
})
