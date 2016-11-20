'use strict'

const Promise = require('bluebird')

const logger = require('winston')

const router = module.exports = require('express').Router()

const l = require('lodash')
const geocoder = require('geocoder')
const geolib = require('geolib')

const sky = require('./skyscanner')

router.get('/start', function (req, res) {
  res.json({
    id: 'LOND-sky',
    place: 'London',
    country: 'United Kingdom'
  })
})

router.get('/search', function (req, res) {
  sky.get('/autosuggest/v1.0/UK/GBP/en-GB', {
    qs: {
      query: req.query.place
    }
  }, function (err, sres, body) {
    if (err) {
      logger.error(err)
      return res.status(500).end()
    }

    if (sres.statusCode !== 200) {
      logger.error(body)
      return res.status(500).end()
    }

    if (!body.Places.length) {
      return res.status(404).end()
    }

    res.json(body.Places.map(function (place) {
      return {
        id: place.PlaceId,
        place: place.PlaceName,
        country: place.CountryName
      }
    }))
  })
})

function getPlaceDetails (placeId) {
  return new Promise(function (resolve, reject) {
    sky.get('/autosuggest/v1.0/UK/GBP/en-GB/', {
      qs: {
        id: placeId
      }
    }, function (err, sres, body) {
      if (err) {
        return reject(err)
      }

      if (sres.statusCode !== 200) {
        return reject(body)
      }

      resolve(body)
    })
  })
}

function extractPlaceDetails (body) {
  return {
    id: body.Places[0].PlaceId,
    place: body.Places[0].PlaceName,
    country: body.Places[0].CountryName
  }
}

function geoMapLocation (place) {
  return new Promise(function (resolve, reject) {
    geocoder.geocode(`${place.place}, ${place.country}`, function (err, geo) {
      if (err) {
        return reject(err)
      }
      resolve(geo)
    })
  }).then(function (loc) {
    return loc.results[0].geometry
  }).then(function (geom) {
    return {
      latitude: (geom.bounds.northeast.lat + geom.bounds.southwest.lat) / 2,
      longitude: (geom.bounds.northeast.lng + geom.bounds.southwest.lng) / 2
    }
  })
}

router.get('/flight', function (req, res) {
  new Promise(function (resolve, reject) {
    sky.get(`/browsequotes/v1.0/UK/GBP/en-GB/${req.query.from}/${req.query.to}/2016-12`, function (err, sres, body) {
      if (err) {
        return reject(err)
      }

      if (sres.statusCode !== 200) {
        return reject(body)
      }

      var mean = l.mean(body.Quotes.map(function (val) {
        return val.MinPrice
      }))
      resolve({
        price: mean
      })
    })
  }).then(function (ret) {
    var p1 = getPlaceDetails(req.query.from)
      .then(extractPlaceDetails)
      .then(geoMapLocation)

    var p2 = getPlaceDetails(req.query.to)
      .then(extractPlaceDetails)
      .then(geoMapLocation)

    return Promise.all([p1, p2])
    .then(function (coords) {
      return geolib.getDistance(coords[0], coords[1])
    }).then(function (dist) {
      ret.distance = dist / 1000
      return ret
    })
  }).then(function (ret) {
    res.json(ret)
  }).catch(function (err) {
    logger.error(err)
    res.status(500).end()
  })
})
