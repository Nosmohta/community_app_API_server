
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
  let user_1_id = '594ff9b2e1e8b8f6f13a5cb7';
  let user_2_id = '594ff9b2e1e8b8f6f13a5cb8';
  let topic_2_id = '594ff9b1e1e8b8f6f13a5cb4';
  let topic_4_id = '594ff9b1e1e8b8f6f13a5cb6';


  // add votes and conversations using created users and topics
  console.log("Set timer: will add votes and conversations in 2 seconds...")
  setTimeout(function () {
    console.log("about to insert the votes and conversations");

    //ADD VOTES
    const Vote = mongoose.model('votes', voteSchema);
    const vote_1 = new Vote({
      user_id: user_1_id,
      topic_id: topic_2_id,
      up_vote: false
    });

    const vote_2 = new Vote({
      user_id: user_1_id,
      topic_id: topic_4_id,
      up_vote: true
    });

    const vote_3 = new Vote({
      user_id: user_2_id,
      topic_id: topic_4_id,
      up_vote: false
    });

    const vote_4 = new Vote({
      user_id: user_2_id,
      topic_id: topic_2_id,
      up_vote: true
    });

    const voteList = [ vote_1, vote_2, vote_3, vote_4];
    Vote.insertMany(voteList);


    //ADD COVERSATIONS
    // const Vote = mongoose.model('votes', voteSchema);
    // const vote_1 = new Vote({
    //   first_name: "andrew",
    //   last_name: "thomson",
    //   email: "andrew@email.com",
    //   password: bcrypt.hashSync('1234', 10),
    //   vote_history:[ ]
    // });
    //
    // const voteList = [vote_1, vote_2]
    // User.insertMany(voteList);


  }, 2000);

})