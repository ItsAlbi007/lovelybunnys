const express = require('express')
const passport = require('passport')

// pull in Mongoose model for bunnys
const Bunny = require('../models/bunny')
const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()


// CREATE
// POST /snacks/
router.post('/snacks/:bunnyId', removeBlanks, (req, res, next) => {
  // save the snack from the request body
  const snack =req.body.snack
  // save the bunnyId for easy ref
  const bunnyId = req.params.bunnyId

	Bunny.findById(bunnyId)
		// make sure we have a bunny
    .then(handle404)
		.then((bunny) => {
      bunny.snack.push(snack)
      
			return bunny.save()
		})
    .then(bunny => res.status(201).json({ bunny: bunny }))
		.catch(next)
})

// UPDATE
// PATCH /snack/5a7db6c74d55bc5awd/
router.patch('/snacks/:bunnyId/:snackId', requireToken, removeBlanks, (req, res, next) => {
  const { bunnyId, snackId } = req.params


	Bunny.findById(bunnyId)
		.then(handle404)
		.then((bunny) => {
      const theSnack = bunny.snacks.id(snackId)
			// it will throw an error if the current user isn't the owner
			requireOwnership(req, bunny)

      // update existing snack
      theSnack.set(req.body.snack)

			// pass the result of Mongoose's `.update` to the next `.then`
			return bunny.save()
		})
		// if that succeeded, return 204 and no JSON
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// DESTROY
// DELETE /snack/5a7db6c74d55bc5awd/
router.delete('/snacks/:bunnyId', removeBlanks, (req, res, next) => {
  // save the snack from the request body
  const snack =req.body.snack
  // save the bunnyId for easy ref
  const bunnyId = req.params.bunnyId

	Bunny.findById(bunnyId)
		// make sure we have a bunny
    .then(handle404)
		.then((bunny) => {
      bunny.snack.push(snack)
      
			return bunny.save()
		})
    .then(bunny => res.status(201).json({ bunny: bunny }))
		.catch(next)
})

// UPDATE
// PATCH /snack/5a7db6c74d55bc5awd/
router.patch('/snacks/:bunnyId/:snackId', requireToken, removeBlanks, (req, res, next) => {
  const { bunnyId, snackId } = req.params


	Bunny.findById(bunnyId)
		.then(handle404)
		.then((bunny) => {
      const theSnack = bunny.snacks.id(snackId)
			// it will throw an error if the current user isn't the owner
			requireOwnership(req, bunny)

      // update existing snack
      theSnack.deleteOne()

			// pass the result of Mongoose's `.update` to the next `.then`
			return bunny.save()
		})
		// if that succeeded, return 204 and no JSON
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

module.exports = router
