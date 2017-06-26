'use strict'
const mongoose   = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');

const voteSchema = require('./voteSchema');
const conversationSchema = require('./conversationSchema');
const communitySchema = require('./communitySchema');

const userSchema = mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, index: true, unique: true, required: true },
  password: { type: String, required: true },
  vote_history:[{ type: mongoose.Schema.Types.ObjectId, ref: 'votes' }],
  communities:[communitySchema],
  conversation_history:[conversationSchema]
  },
  {
    timestamps: {
      createdAt: 'created_at'
    }
  });

userSchema.plugin(uniqueValidator);

module.exports = userSchema;