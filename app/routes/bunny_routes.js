// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for bunnys
const Bunny = require('../models/bunny')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /bunnys
router.get('/bunnys',(req, res, next) => {
	Bunny.find()
		.then((bunnys) => {
			// `bunnys` will be an array of Mongoose documents
			// we want to convert each one to a POJO, so we use `.map` to
			// apply `.toObject` to each one
			return bunnys.map((bunny) => bunny.toObject())
		})
		// respond with status 200 and JSON of the bunnys
		.then((bunnys) => res.status(200).json({ bunnys: bunnys }))
		// if an error occurs, pass it to the handler
		.catch(next)
})
router.get('/threeBunnys',(req, res, next) => {
	Bunny.find().limit(3)
		.then((bunnys) => {
			// `bunnys` will be an array of Mongoose documents
			// we want to convert each one to a POJO, so we use `.map` to
			// apply `.toObject` to each one
			return bunnys.map((bunny) => bunny.toObject())
		})
		// respond with status 200 and JSON of the bunnys
		.then((bunnys) => res.status(200).json({ bunnys: bunnys }))
		// if an error occurs, pass it to the handler
		.catch(next)
})
// show route for only the logged in users pets
// GEt /bunnys/mine
// requiretoken gives us access to req.user.id
router.get('/bunnys/mine', requireToken, (req, res, next) => {
	Bunny.find({owner: req.user.id})
		.then((bunnys) => {
			// `bunnys` will be an array of Mongoose documents
			// we want to convert each one to a POJO, so we use `.map` to
			// apply `.toObject` to each one
			return bunnys.map((bunny) => bunny.toObject())
		})
		// respond with status 200 and JSON of the bunnys
		.then((bunnys) => res.status(200).json({ bunnys: bunnys }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// SHOW
// GET /bunnys/5a7db6c74d55bc51bdf39793/token number
router.get('/bunnys/:id', (req, res, next) => {
	// req.params.id will be set based on the `:id` in the route
	Bunny.findById(req.params.id)
  .populate('owner')
		.then(handle404)
		// if `findById` is succesful, respond with 200 and "bunny" JSON
		.then((bunny) => res.status(200).json({ bunny: bunny.toObject() }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// CREATE
// POST /bunnys
router.post('/bunnys', requireToken, (req, res, next) => {
	// set owner of new bunny to be current user
	req.body.bunny.owner = req.user.id

	Bunny.create(req.body.bunny)
		// respond to succesful `create` with status 201 and JSON of new "bunny"
		.then((bunny) => {
			res.status(201).json({ bunny: bunny.toObject() })
		})
		// if an error occurs, pass it off to our error handler
		// the error handler needs the error message and the `res` object so that it
		// can send an error message back to the client
		.catch(next)
})

// UPDATE
// PATCH /bunnys/5a7db6c74d55bc51bdf39793
router.patch('/bunnys/:id', requireToken, removeBlanks, (req, res, next) => {
	// if the client attempts to change the `owner` property by including a new
	// owner, prevent that by deleting that key/value pair
	delete req.body.bunny.owner

	Bunny.findById(req.params.id)
		.then(handle404)
		.then((bunny) => {
			// pass the `req` object and the Mongoose record to `requireOwnership`
			// it will throw an error if the current user isn't the owner
			requireOwnership(req, bunny)

			// pass the result of Mongoose's `.update` to the next `.then`
			return bunny.updateOne(req.body.bunny)
		})
		// if that succeeded, return 204 and no JSON
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// DESTROY
// DELETE /bunnys/5a7db6c74d55bc51bdf39793
router.delete('/bunnys/:id', requireToken, (req, res, next) => {
	Bunny.findById(req.params.id)
		.then(handle404)
		.then((bunny) => {
			// throw an error if current user doesn't own `bunny`
		requireOwnership(req, bunny)
			// delete the bunny ONLY IF the above didn't throw
		bunny.deleteOne()
		})
		// send back 204 and no content if the deletion succeeded
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

module.exports = router
