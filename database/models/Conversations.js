'use strict'

const mongoose = require('mongoose');
const conversationSchema = require('../schema/conversationSchema');


const Conversations = mongoose.model('conversations', conversationSchema);
module.exports = Conversations;
