'use strict'

const mongoose   = require("mongoose");

const voteSchema = mongoose.Schema({
  user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
  topic_id: {type: mongoose.Schema.Types.ObjectId, ref: 'topics'},
  up_vote: Boolean
  },
  {
  timestamps: {
    createdAt: 'created_at'
    }
  }

);

module.exports = voteSchema;

