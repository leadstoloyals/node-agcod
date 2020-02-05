const BigNumber = require('bignumber.js')
const request = require('request')
const aws4 = require('aws4')
const helpers = require('./lib/helpers')

const {
  AGCOD_ACCESS_KEY_ID,
  AGCOD_SECRET_ACCESS_KEY,
  AGCOD_PARTNERID,
  AGCOD_ENV = 'production',
} = process.env;

module.exports = class {
  constructor(cfg = {}) {
    this.config = Object.assign({}, {
      // defaults to the environment variables that may be present
      accessKeyId: AGCOD_ACCESS_KEY_ID,
      secretAccessKey: AGCOD_SECRET_ACCESS_KEY,
      partnerId: AGCOD_PARTNERID,
      env: AGCOD_ENV,
    }, cfg)

    // console.log('construct', cfg, this.config);

    if (!this.config.accessKeyId) {
      throw new Error(`Either make sure environment variable AGCOD_ACCESS_KEY_ID is present OR pass a config with key accessKeyId`)
    }
    if (!this.config.secretAccessKey) {
      throw new Error(`Either make sure environment variable AGCOD_SECRET_ACCESS_KEY is present OR pass a config with key secretAccessKey`)
    }
    if (!this.config.partnerId) {
      throw new Error(`Either make sure environment variable AGCOD_PARTNERID is present OR pass a config with key partnerId`)
    }
  }

  createGiftCard(region, amount, currencyCode, externalReference, cb) {
    this._checkRegion(region)
    const sequentialId = this._getNewId()
    const requestBody = this._getCreateGiftCardRequestBody(sequentialId, amount, currencyCode, externalReference)
    const signedRequest = this._getSignedRequest(region, 'CreateGiftCard', requestBody)
    const req = this._doRequest(signedRequest, cb)

    return {req, sequentialId, requestBody, signedRequest}
  }

  createGiftCardAgain(region, amount, currencyCode, sequentialId, cb) {
    this._checkRegion(region)
    const requestBody = this._getCreateGiftCardRequestBody(sequentialId, amount, currencyCode)
    const signedRequest = this._getSignedRequest(region, 'CreateGiftCard', requestBody)
    const req = this._doRequest(signedRequest, cb)

    return {req, sequentialId, requestBody, signedRequest}
  }

  cancelGiftCard(region, sequentialId, gcId, cb) {
    this._checkRegion(region)
    const requestBody = this._getCancelGiftCardRequestBody(sequentialId, gcId)
    const signedRequest = this._getSignedRequest(region, 'CancelGiftCard', requestBody)
    const req = this._doRequest(signedRequest, cb)

    return {req, requestBody, signedRequest}
  }

  _getEndpoint(region) {
    if (region === 'NA') return {
      "host": `agcod-v2${this.config.env === 'production' ? '' : '-gamma'}.amazon.com`,
      "region": "us-east-1",
      "countries": [ "US", "CA"]
    };
    if (region === 'EU') return {
      "host": `agcod-v2-eu${this.config.env === 'production' ? '' : '-gamma'}.amazon.com`,
      "region": "eu-west-1",
      "countries": [ "IT", "ES", "DE", "FR", "UK"]
    };
    if (region === 'FE') return {
      "host": `agcod-v2-fe${this.config.env === 'production' ? '' : '-gamma'}.amazon.com`,
      "region": "us-west-2",
      "countries": "JP"
    };
  }

  /**
   * Throws when region is not NA, EU or FE
   */
  _checkRegion(region) {
    if (['NA', 'EU', 'FE'].indexOf(region) === -1 ) {
      throw new Error(`First argument must be string NA, EU or FE`)
    }
  }

  /**
   * Builds the request body to be POSTed for creating a gift card
   * @returns {Object}
   */
  _getCreateGiftCardRequestBody(sequentialId, amount, currencyCode, externalReference) {
    return helpers.CreateGiftCardRequest(
      this.config.partnerId,
      sequentialId, amount, currencyCode, externalReference
    )
  }

  /**
   * Builds the request body to be POSTed for cancelling a gift card
   * @returns {Object}
   */
  _getCancelGiftCardRequestBody(sequentialId, gcId) {
    return helpers.CancelGiftCardRequest(
      this.config.partnerId,
      sequentialId, gcId
    )
  }

  /**
   * Builds an object with all the specifics for a new https request
   * it includes headers with a version 4 signing authentication header
   * @param {string} region - 'NA' for US/CA, 'EU' for IT/ES/DE/FR/UK, 'FE' for JP
   * @param {string} action - 'CreateGiftCard' or 'CancelGiftCard'
   * @param {Object} requestBody - generated by _getCreateGiftCardRequestBody or _getCancelGiftCardRequestBody
   * @returns {Object}
   */
  _getSignedRequest(region, action, requestBody) {
    const credentials = {
      "accessKeyId": this.config.accessKeyId,
      "secretAccessKey": this.config.secretAccessKey,
    }
    const endpoint = this._getEndpoint(region);
    const opts = {
      region: endpoint.region,
      host: endpoint.host,
      path: `/${action}`,
      body: JSON.stringify(requestBody),
      // defaults
      service: 'AGCODService',
      headers: Object.assign({
        'accept': `application/json`,
        'content-type': `application/json`,
        'x-amz-target': `com.amazonaws.agcod.AGCODService.${action}`
      }, this.config.extraHeaders),
      method: 'POST',
      securityOptions: 'SSL_OP_NO_SSLv3'
    }

    return aws4.sign(opts, credentials)
  }

  /**
   * Makes the https based on the object created _getSignedRequest
   * @param {Object} signedRequest - signed re'NA' for US/CA, 'EU' for IT/ES/DE/FR/UK, 'FE' for JP
   * @param {Function} cb - Callback function
   * @returns {Object} - whatever node-request returns
   */
  _doRequest(signedRequest, cb) {
    const params = {
      method: 'POST',
      url: `https://${signedRequest.host}${signedRequest.path}`,
      headers: signedRequest.headers,
      body: signedRequest.body
    }

    return request(params, (error, response, result) => {
      if (error) return cb(error)

      if (response.statusCode !== 200) {
        const err = Object.assign({
          request: params,
          statusCode: response.statusCode
        }, JSON.parse(result))

        return cb(err)
      }

      return cb(null, JSON.parse(result))
    })
  }

  /**
   * Generates a unique sequential base-36 string based on processor time
   * @returns string with length of 10
   */
  _getNewId()  {
    let hrTime = process.hrtime()
    let id = new BigNumber(hrTime[0]).times('1e9').plus(hrTime[1]).toString(36)
    return id
  }
}
