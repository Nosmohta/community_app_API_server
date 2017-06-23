// run this file to seed the database with sample data: empty database first.
const mongoose = require("mongoose");
require('dotenv').config();
const fs = require('fs')



//Import Schemas
const communitySchema = require('../Schema/communitySchema')
const userSchema = require('../Schema/userSchema')
const topicSchema = require('../Schema/topicSchema')
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
    img:{
      //large: fs.readFileSync('/Users/andrewthomson/lighthouse/final_project/community_api/database/seeds/seedData/topic_1.jpg'),
      //small: fs.readFileSync('/Users/andrewthomson/lighthouse/final_project/community_api/database/seeds/seedData/topic_1_sml.jpg'),
      contentType: 'image/jpg'
    },
    description: 'This pothole is in my way!',
    up_votes: 87,
    down_votes: 15,
    date_created: Date.now() - (86400000*24)
  });

  const topic_2 = new Topic({
    subject: 'curb',
    img:{
      //large: fs.readFileSync('/Users/andrewthomson/lighthouse/final_project/community_api/database/seeds/seedData/topic_2.jpg'),
      //small: fs.readFileSync('/Users/andrewthomson/lighthouse/final_project/community_api/database/seeds/seedData/topic_2_sml.jpg'),
      contentType: 'image/jpg'
    },
    description: "I can't move over this curb in my wheelchair",
    up_votes: 128,
    down_votes: 3,
    date_created: Date.now()- (86400000*14)
  });

  const topic_3 = new Topic({
    subject: 'fallen tree',
    img:{
      //large: fs.readFileSync('/Users/andrewthomson/lighthouse/final_project/community_api/database/seeds/seedData/topic_3.jpg'),
      //small: fs.readFileSync('/Users/andrewthomson/lighthouse/final_project/community_api/database/seeds/seedData/topic_3_sml.jpg'),
      contentType: 'image/jpg'
    },
    description: 'A tree has fallen down on my street.',
    up_votes: 5,
    down_votes: 64,
    date_created: Date.now()- (86400000*2)
  });

  const topic_4 = new Topic({
    subject: 'streetscape',
    img:{
      //large: fs.readFileSync('/Users/andrewthomson/lighthouse/final_project/community_api/database/seeds/seedData/topic_4.jpg'),
      //small: fs.readFileSync('/Users/andrewthomson/lighthouse/final_project/community_api/database/seeds/seedData/topic_4_sml.jpg'),
      contentType: 'image/jpg'
    },
    description: 'I really like this street design!',
    up_votes: 1,
    down_votes: 0,
    date_created: Date.now()- (86400000*30)
  });

  const topicList = [topic_1, topic_2, topic_3, topic_4]
  Topic.insertMany(topicList);

// USER SEEDS:
  const User = mongoose.model('users', userSchema);

  const user_1 = new User({
    first_name: "rich",
    last_name: "forester",
    email: "rich@email.com",
    password: bcrypt.hashSync('1234', 10),
    vote_history:[ {
      vote_date: Date.now(),
      topic_id: topic_4.id,
      up_vote: true
    },{
      vote_date: Date.now(),
      topic_id: topic_1.id,
      up_vote: false
    }]
  });

  const user_2 = new User({
    first_name: "andrew",
    last_name: "thomson",
    email: "andrew@email.com",
    password: bcrypt.hashSync('1234', 10),
    vote_history:[ {
      vote_date: Date.now(),
      topic_id: topic_1.id,
      up_vote: true
    },{
      vote_date: Date.now(),
      topic_id: topic_2.id,
      up_vote: false
    }]
  });

  const userList = [user_1, user_2]
    User.insertMany(userList);




});

