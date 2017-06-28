
// run this file to seed the database with sample data: empty database first.
const mongoose = require("mongoose");
require('dotenv').config();
const fs = require('fs')

//Import Schemas
const communitySchema = require('../Schema/communitySchema');
const userSchema = require('../Schema/userSchema');
const topicSchema = require('../Schema/topicSchema');
const voteSchema = require('../Schema/voteSchema');
const conversationSchema = require('../Schema/conversationSchema');
const bcrypt = require("bcrypt");

const Users       = require("../models/Users");


// connect to mlab database
const dbuser = process.env.USERNAME;
const dbpass = process.env.PASSWORD;
const uri = "mongodb://" + dbuser + ":" + dbpass + "@ds131312.mlab.com:31312/communityapp2017";
mongoose.Promise = global.Promise;
const options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
  replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };
mongoose.connect(uri, options);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// on "open" connection seed the data
db.once('open', () => {

  // update these id strings if you have rebuilt the users and topics DB

  Users.findOne({'email': 'andrew@email.com'})
    .then( (andrew) => {
      andrew.communities.push( 'City of Calgary', 'Parkdale', 'Lighthouse Labs')
      andrew.save()
    })


  // add votes and conversations using created users and topics
  console.log("Set timer: will add votes and conversations in 4 seconds...")
  setTimeout(function () {
    console.log("about to insert the votes and conversations");

    Users.findOne({'email': 'rich@email.com'})
      .then( (rich) => {
        rich.communities.push( 'City of Calgary', 'Kilarney', 'Lighthouse Labs')
        rich.save()
      })

  }, 4000);

})