'use strict'

const mongoose = require("mongoose");

const communitySchema = mongoose.Schema({
    name: String,
    type: {
        type: String,
        enum: ['city', 'neighbourhood', 'university', 'provence', 'country', 'state', ]
      },
    location: {lat: Number, long: Number}
  });

module.exports = communitySchema;