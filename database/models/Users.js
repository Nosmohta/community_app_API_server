'use strict'

const mongoose = require('mongoose');
const userSchema = require('../schema/userSchema')


const Users = mongoose.model('users', userSchema);
module.exports = Users;
