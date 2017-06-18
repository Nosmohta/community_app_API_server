'use strict'

const mongoose   = require("mongoose");

const topicSchema = mongoose.Schema({
    subject: String,
    picture_VML: String,
    description: String,
    description_NPL: String,
    votes: [{
      vote_date: Date,
      vote_up: Boolean
    }]
  });

module.exports = topicSchema;

