'use strict'

const router = module.exports = require('express').Router()

router.use('/health', require('./health'))
router.use('/highscore', require('./highscore'))
router.use('/travel', require('./travel'))
