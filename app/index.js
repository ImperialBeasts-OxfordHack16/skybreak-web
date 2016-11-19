'use strict'

const router = module.exports = require('express').Router()

router.use('/health', require('./health'))
