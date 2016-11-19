'use strict'

const db = require('mongoose')
const Schema = db.Schema

const schema = new Schema({
  name: String,
  score: Number
})

module.exports = db.model('Score', schema)
