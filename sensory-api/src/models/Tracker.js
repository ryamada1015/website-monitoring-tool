// trackerModel.js
const mongoose = require("mongoose")

const trackerSchema = mongoose.Schema({
  statusCode: {
    type: Number,
  },
  isUp: {
    type: Boolean,
  },
  contentHash: {
    type: String,
  },
  networkActivity: {
    type: [[]],
  },
  cookies: {
    type: [Object],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  responseTime: {
    type: Number,
  },
  loadTime: {
    type: Number,
  },
  url: {
    type: String,
  },
})

const Tracker = mongoose.model("Tracker", trackerSchema)

module.exports = Tracker
