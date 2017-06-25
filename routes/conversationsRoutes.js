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
const db_util          = require("../utilities/DB_helpers.js")


//POST conversation root
router.post("/", (req, res) => {
  let data = {}
  res.json(data);
});

//POST conversation photo handled in uploadRoutes (this is to allow for alternate security system while using Form/Data)

//POST conversation DESCRIPTION
router.post("/:conversation_id/description", (req, res) => {
  // Create request object with "topic description"
  const content = req.body.description;
  console.log(content);
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
  };
  console.log(nlpOptions);
  // make api post to google NLP API
  rpn(nlpOptions)
    .then( (data) => console.log("data from NLP", data))
    .catch( (err) => console.log(err));
  // create new topic for user
  // save data to topic in DB
  // respond with object All?
  let test = {'subject_guess': ["pothole", "concrete"]};
  res.json(test);
});




//POST conversation SUBJECT
router.post("/:conversation_id/subject", (req, res) => {
  const conv_id = req.params.conversation_id;
  const answer = req.body.answer


  let test = {
    question:{
      type: 'END',
      paylad: 'Thank you for contributing to your community!'
    },
    new_topic: {
      subject: 'streetscape',
      img_path: 'http://localhost:8080/photos/topic_5',
      description: 'I really like this street design!',
      up_votes: 0,
      down_votes: 0,
      date_created: Date.now()
    }
  };
  res.json(test);
});


//POST conversation ANSWER
router.post("/:conversation_id/answer", (req, res) => {
  const conv_id = req.params.conversation_id;

  let test = {
    question:{
      type: 'END',
      paylad: 'Thank you for contributing to your community!'
    }
  };
  res.json(test);
});

module.exports = router;

