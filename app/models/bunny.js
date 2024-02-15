const mongoose = require('mongoose')

const snackSchema = require('./snack')

const bunnySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			required: true,
		},
		age: {
			type: Number,
			required: true,
		},
		thumbnail: {
			type: String,
			default: "",
		},
		forsale: {
			type: Boolean,
			required: true,
			default: false,
		},
		snack: [snackSchema],
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			//required: true,
		},
	},
	{
		timestamps: true,
		toObject: {virtuals: true},
		toJSON: {virtuals: true},
	}
)

bunnySchema.virtual('fullTitle').get(function() {
	return `${this.name} the ${this.type}`
})

bunnySchema.virtual('isABaby').get(function () {
	if (this.age < 5) {
		return "Yeah, theyre just a baby"
	}else if (this.age >= 5 && this.age <10) {
		return "not really a baby, but like, still a baby"
	}else {
		return "a good old bunny (definitely still a baby)"
	}
})

module.exports = mongoose.model('Bunny', bunnySchema)
