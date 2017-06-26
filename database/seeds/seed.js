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

// COMMUNITY SEEDS:
  const Community = mongoose.model('community', communitySchema);

  const calgary = new Community({
    name: 'calgary',
    type: 'city'
  });
  const westhillhurst = new Community({
    name: 'westhillhurst',
    type: 'neighbourhood'
  });
  const u_of_c = new Community({
    name: 'university of calgary',
    type: 'university'
  });

  const communityList = [ calgary, westhillhurst, u_of_c]
    Community.insertMany(communityList);

// Topic SEEDS:
  const Topic = mongoose.model('topic', topicSchema);

  const topic_1 = new Topic({
    subject: 'pothole',
    img_path: 'http://localhost:8080/upload/photos/topic_1.jpg',
    description: 'This pothole is in my way!',
    up_votes: 87,
    down_votes: 15
  });

  const topic_2 = new Topic({
    subject: 'curb',
    img_path: 'http://localhost:8080/upload/photos/topic_2.jpg',
    description: "I can't move over this curb in my wheelchair",
    up_votes: 128,
    down_votes: 3
  });

  const topic_3 = new Topic({
    subject: 'fallen tree',
    img_path: 'http://localhost:8080/upload/photos/topic_3.jpg',
    description: 'A tree has fallen down on my street.',
    up_votes: 5,
    down_votes: 64
  });

  const topic_4 = new Topic({
    subject: 'streetscape',
    img_path: 'http://localhost:8080/upload/photos/topic_4.jpg',
    description: 'I really like this street design!',
    up_votes: 1,
    down_votes: 0
  });

  const topicList = [topic_1, topic_2, topic_3, topic_4]
  Topic.insertMany(topicList);

// USER SEEDS:
  const User = mongoose.model('users', userSchema);

  const user_1 = new User({
    first_name: "rich",
    last_name: "forester",
    email: "rich@email.com",
    password: bcrypt.hashSync('1234', 10)
  });

  const user_2 = new User({
    first_name: "andrew",
    last_name: "thomson",
    email: "andrew@email.com",
    password: bcrypt.hashSync('1234', 10)
  });

  const userList = [user_1, user_2];
    User.insertMany(userList);



});


