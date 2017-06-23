"use strict";

const express     = require('express');
const router      = express.Router();
const session     = require('express-session');
const request     = require('request');
const rpn         = require('request-promise-native');
const jwt         = require('jsonwebtoken');

require('dotenv').config();

//Bring needed models into scope.
const Users       = require("../database/models/Users");
const Topics      = require("../database/models/Topics");
const db          = require("../utilities/DB_helpers.js")

  router.get("/", (req, res) => {
    let data = {};
    res.json(data);
  });


  router.get("/topics", (req, res) => {
    Topics.find()
      .then((data) => res.json(data))
      .catch((err) => {
        console.log(err);
        res.status(401).json({message: "Topics have failed to load."})
    })
  });


  // LOAD USER Relevant TOPICS on REQUEST
  router.post("/topics", (req, res) => {

    let user_id = jwt.verify(req.body.token, process.env.APP_SECRET_KEY).id;
    console.log('user id: ', user_id);
    let userVoteHistory = {}
    Users.findOne({'_id': user_id})
      .then( (user) => { userVoteHistory = user.vote_history
        Topics.find()
          .then((topics) => {
            let data = [];
            topics.forEach((topic) => {
              const userData = {
                'user_data':{
                  'vote_pending': false,
                  'vote_up': db.userHistoryOnTopic( userVoteHistory, topic.id, true ),
                  'vote_down': db.userHistoryOnTopic( userVoteHistory, topic.id, false)
                  }
                }
              data.push(Object.assign({}, topic.toJSON(), userData));
            })
            res.json({topics: data});
          })
      })
      .catch((err) => {
        console.log(err);
        res.status(401).json({message: "Topics have failed to load."})
      })
  });



  router.post( "/vote", (req, res) => {
    let user_id = jwt.verify(req.body.token, process.env.APP_SECRET_KEY).id;
    console.log('user id: ', user_id);
    if(user_id) {
      let newVote = {
        'vote_date': Date.now(),
        'topic_id': req.body.topic_id,
        'up_vote': (req.body.vote_up === 'true')
      };
      let options = {
        safe: true,
        upsert: true,
        new: true
      };
      Users.findByIdAndUpdate(user_id, {$push: {'vote_history': newVote}}, options)
        .then(() => {
          let voteProp = (req.body.vote_up === 'true') ? 'up_votes' : 'down_votes';
          Topics.findByIdAndUpdate(req.body.topic_id, {$inc: {[voteProp]:1}})
            .then(res.json({message: 'Success Voting'}))
        })
        .catch(err => {
          console.log(err);
          res.status(401).json({message:'A failure occured while trying to save your vote in database.'})
        })
    }else{
      res.status(401).json({message: 'No user was found, try logging in again to update your token.'});
    }
  });



  router.get("/users", (req, res) => {
    Users.find()
        .then((data) => res.json(data))
        .catch((err) => console.log(err))
  });

  router.post("/topics/new", (req, res) => {
      // autenticate user
      // Create request object with "topic description"

      const content = req.body.topicDescription.toString()
      console.log(content)
      const nlpOptions = {
        method: 'POST',
        uri: 'https://language.googleapis.com/v1/documents:analyzeEntities?fields=entities&key=' + process.env.GOOGLE_API_KEY,
        body:{
          document: {
            type: 'PLAIN_TEXT',
            language: 'EN',
            content: content
          },
          encodingType: 'UTF8'
        },
        json: true
      }
       console.log(nlpOptions)

      // make api post to google NLP API
      rpn(nlpOptions)
        .then( (data) => console.log("data from NLP", data))
        .catch( (err) => console.log(err));

      // create new topic for user
      // save data to topic in DB
      // respond with opject All?

      const data = {};

      res.json(data)

  })


module.exports = router