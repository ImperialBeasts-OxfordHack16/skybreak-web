'use strict'

require('dotenv').load()

const logger = require('winston')
logger.setLevels(logger.config.syslog.levels)
logger.addColors(logger.config.syslog.colors)
logger.remove(logger.transports.Console)
logger.add(logger.transports.Console, {
  colorize: true,
  handleExceptions: true,
  humanReadableUnhandledException: true
})
logger.level = process.env.LOG_LEVEL || 'info'

const yn = require('yn')

if (yn(process.env.LONGSTACK)) {
  require('longjohn')
}

const http = require('http')

const express = require('express')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const morgan = require('morgan')
const mongoose = require('mongoose')

mongoose.Promise = require('bluebird')
const db = mongoose.connect(process.env.DB, {
  db: {
    promiseLibrary: require('bluebird')
  }
})

db.connection.on('error', function (err) {
  logger.error('Database error:', err)
})

const app = module.exports = express()
const server = http.Server(app)

app.set('server', server)
app.set('port', process.env.PORT || 3000)
app.set('db', db)
app.use(helmet())
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(methodOverride())

app.use('/', require('./app'))

if (yn(process.env.ERRORHANDLER)) {
  const errorHandler = require('errorhandler')
  app.use(errorHandler())
}
