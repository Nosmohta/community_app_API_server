'use strict'

const mongoose = require('mongoose');
const topicSchema = require('../schema/topicSchema')


const Topics = mongoose.model('topics', topicSchema);
module.exports = Topics;
