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
const Votes       = require("../database/models/Votes");

const db_util          = require("../utilities/DB_helpers.js");


// LOAD USER Relevant TOPICS on REQUEST
router.post("/", (req, res) => {
  let user_id = jwt.verify(req.body.token, process.env.APP_SECRET_KEY).id;
  Users.findOne({'_id': user_id})
    .populate('vote_history')
    .then( (user) => {
      if(user) {
        const userVoteHistory = user.vote_history;
        Topics.find().sort('-created_at')
          .then((topics) => {
            let data = [];
            topics.forEach((topic) => {
              const userData = {
                'vote_pending': false,
                'vote_up':   db_util.userHistoryOnTopic(userVoteHistory, topic.id, true),
                'vote_down': db_util.userHistoryOnTopic(userVoteHistory, topic.id, false)
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
  let vote_up = req.body.vote_up == 'true'
  if(user_id) {
    Users.findOne({'_id': user_id})
      .then( (user) => {
        Topics.findOne({'_id': req.params.topic_id})
          .then( (topic) => {
            let newVote = new Votes({
              'user_id': user,
              'topic_id': topic,
              'up_vote': vote_up
            })
            newVote.save()
              .then( () => {
                user.vote_history.push(newVote);
                user.save()
                  .then( () => {
                    let topic_up_votes = topic.up_votes;
                    let topic_down_votes = topic.down_votes;
                    vote_up?
                      topic.set('up_votes', topic_up_votes + 1):
                      topic.set('down_votes', topic_down_votes + 1 );

                    topic.save()
                      .then(
                        res.json({
                          vote_up: vote_up,
                          vote_down: !vote_up,
                          vote_pending: false
                        })
                      )
                  })
              })
          })
      })
      .catch(err => {
        console.log(err);
        res.status(401).json({message:'A failure occured while trying to save your vote in database.'})
      })
  }else{
    res.status(401).json({message: 'No user was found, try logging in again to update your token.'});
  }
});


// POST Cancel VOTE ROUTE : deletes user previous vote on topic
router.post( "/:topic_id/cancel", (req, res) => {
  let user_id = jwt.verify(req.body.token, process.env.APP_SECRET_KEY).id;
  let topic_id = req.params.topic_id;

  if (user_id) {
    Votes.findOneAndRemove({'topic_id': topic_id, 'user_id': user_id})
      .then((vote) => {
        //down increment the topics vote.
        const up_vote = vote.up_vote;
        Topics.findOne( {'_id': topic_id})
          .then( (topic) => {
            let incrementProp = (up_vote === true) ? 'up_votes' : 'down_votes';
            topic.set( incrementProp, topic[incrementProp] -1 )
            topic.save()
              .then(res.json({
                message: 'Success deleting vote.',
                vote_up: false,
                vote_down: false,
                vote_pending: false
                })
              )
              .catch( err => {res.status(401).json({message: 'Failed to down increment topic vote total'})});
          })
          .catch(err => {
            console.log(err);
            res.status(401).json({message: 'Failed to find topic.'})
          });
      })
      .catch(err => {
        console.log(err);
        res.status(401).json({message: 'Failed to find and remove vote in database.'})
      });
  } else {
    res.status(401).json({message: 'Invalid token. Please login again.'})
  }

});


module.exports = router;

