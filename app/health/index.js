'use strict'

const router = module.exports = require('express').Router()

router.get('/', function (req, res) {
  if (req.app.get('db').connection.readyState === 1) {
    res.json({health: 'ok', uptime: process.uptime()})
  } else {
    res.status(500).json({heath: 'unhealthy'})
  }
})
