'use strict'

const mongoose   = require("mongoose");

const userSchema = mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    password: String,
    vote_history:[ {
      vote_date: Date,
      topic_id: String,
      up_vote: Boolean
    }],
    communities:[],
    date_created: Date

  });

module.exports = userSchema;