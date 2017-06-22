'use strict'

const mongoose   = require("mongoose");

const topicSchema = mongoose.Schema({
    subject: String,
    picture_VML: String,
    description: String,
    description_NPL: String,
    up_votes: Number,
    down_votes: Number

  });

module.exports = topicSchema;

