'use strict'
const mongoose   = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, index: true, unique: true, required: true },
    password: { type: String, required: true },
    vote_history:[ {
      vote_date: Date,
      topic_id: mongoose.Schema.Types.ObjectId,
      up_vote: Boolean
    }],
    communities:[],
    date_created: Date,
    conversation_history: [{
      conversation_id: String,
      start_date: Date,
      update_date: Date,
      canceled: Boolean,
      topic_id: String,
      photo: String,
      description: String,
      subject: String,
    }]

 });

userSchema.plugin(uniqueValidator);

module.exports = userSchema;