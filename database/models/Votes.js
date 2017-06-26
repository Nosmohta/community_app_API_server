'use strict'

const mongoose = require('mongoose');
const voteSchema = require('../schema/voteSchema');


const Votes = mongoose.model('votes', voteSchema);
module.exports = Votes;
