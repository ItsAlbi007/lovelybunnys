const mongoose = require('mongoose')

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
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			//required: true,
		},
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Bunny', bunnySchema)
