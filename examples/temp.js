process.env.NODE_ENV = 'sandbox'
const Client = require('../')
const client = new Client()

client.createGiftCard('NA', 123, 'USD', (error, result) => {
  console.log('client.createGiftCard response', error, result)
})
