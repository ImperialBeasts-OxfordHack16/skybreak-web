'use strict'

const request = require('request')

const api = request.defaults({
  baseUrl: 'http://partners.api.skyscanner.net/apiservices/',
  qs: {
    apiKey: process.env.SKYSCANNER_API_KEY
  },
  json: true
})

module.exports = api
