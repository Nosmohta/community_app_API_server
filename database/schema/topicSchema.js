'use strict'

const mongoose   = require("mongoose");

const topicSchema = mongoose.Schema({
    subject: String,
    img_path: String,
    picture_VML: String,
    description: String,
    description_NPL: String,
    up_votes: Number,
    down_votes: Number,
    date_created: Date
  });

module.exports = topicSchema;

