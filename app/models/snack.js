// import dependecies
const mongoose = require('mongoose')

const snackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
},{ timestamps: true })

module.exports = snackSchema