'use strict'

const mongoose   = require("mongoose");

const topicSchema = mongoose.Schema({
    subject: String,
    picture_VML: String,
    description: String,
    description_NPL: String
  });

module.exports = topicSchema;


// // votes: [
//       {vote_date: Date.now(), vote_up: true},
//       {vote_date: Date.now(), vote_up: true},
//       {vote_date: Date.now(), vote_up: false}
//     ]
//   }

