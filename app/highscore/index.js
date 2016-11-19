'use strict'

const logger = require('winston')

require('./model')

const router = module.exports = require('express').Router()

router.route('/')
.get(function (req, res) {
  const Score = req.app.get('db').model('Score')

  Score.find({})
    .select({name: 1, score: 1, _id: 0})
    .sort({score: 'desc'})
    .limit(10)
    .exec()
    .then(res.json.bind(res))
    .catch(function (err) {
      logger.error(err)
      res.status(500).end()
    })
})
.post(function (req, res) {
  const Score = req.app.get('db').model('Score')

  new Score({
    name: req.body.name,
    score: req.body.score
  }).save()
    .then(res.end.bind(res))
    .catch(function (err) {
      logger.error(err)
      res.status(500).end()
    })
})
