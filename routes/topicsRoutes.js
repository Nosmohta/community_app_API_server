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
const db_util          = require("../utilities/DB_helpers.js");



// LOAD USER Relevant TOPICS on REQUEST
router.post("/", (req, res) => {

  console.log("made it to topics!")
  let user_id = jwt.verify(req.body.token, process.env.APP_SECRET_KEY).id;
  console.log('user id: ', user_id);
  let userVoteHistory = {}
  Users.findOne({'_id': user_id})
    .then( (user) => {
      if(user) {
        userVoteHistory = user.hasOwnProperty('vote_history') ? user.vote_history : []
        Topics.find()
          .then((topics) => {
            let data = [];
            topics.forEach((topic) => {
              const userData = {
                'user_data': {
                  'vote_pending': false,
                  'vote_up': db_util.userHistoryOnTopic(userVoteHistory, topic.id, true),
                  'vote_down': db_util.userHistoryOnTopic(userVoteHistory, topic.id, false)
                }
              }
              data.push(Object.assign({}, topic.toJSON(), userData));
            })
            res.json({topics: data});
          })
          .catch((err) => {
            console.log(err);
            res.status(401).json({message: "Topics have failed to load."})
          })
      } else {
        res.status(401).json({message: "Not a valid user. Please try logging in."})
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(401).json({message: "Topics have failed to load."})
    })
});


// POST VOTE ROUTE : saves a vote to the database
router.post( "/:topic_id/vote", (req, res) => {
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

// POST Cancle VOTE ROUTE : renders last user vote invalid and down increments the topics total.
router.post( "/:topic_id/cancel", (req, res) => {
  let user_id = jwt.verify(req.body.token, process.env.APP_SECRET_KEY).id;
  let topic_id = req.body.topic_id;
  console.log(user_id);
  Users.findOne({'_id': user_id })
    .then( (user) => {

      //console.log(user.vote_history);
      //finde user and update history....how?
      let vote_history = user.vote_history.reduce( (acc, i, vote) => (vote.topic_id === topic_id)? i : false)
      console.log(vote_history);

      res.json({
        message: 'success',
        test: "test"
      })
    })
    .catch(err => {
      console.log(err);
      res.status(401).json({message:'A failure occured while trying to CANCEL your vote in database.'})
    });

});


module.exports = router;

