'use strict'

const mongoose   = require("mongoose");

const voteSchema = mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'topic' },
    photo: String,
    description: String,
    subject: String,
    subject_guess: [String]
  },
  {
    timestamps: {
      createdAt: 'created_at'
    }
  }

);

module.exports = voteSchema;


{

}