"use strict";

const express     = require('express');
const router      = express.Router();
const session     = require('express-session');
const request     = require('request');
const rpn          = require('request-promise-native');

require('dotenv').config();

//Bring needed models into scope.
const Users       = require("../database/models/Users");
const Topics      = require("../database/models/Topics");

  router.get("/", (req, res) => {
    let data = {}
    res.json(data);
  });

  router.get("/topics", (req, res) => {
    Topics.find()
        .then((data) => res.json(data))
        .catch((err) => console.log(err))
  });

  router.post( "/vote", (req, res) => {
    console.log(req.body.token);
    console.log(req.body.vote_up);
    console.log(req.body.vote_down);
    console.log(req.body.topic_id);
    //autenticate user
    //update user voting history
    //update topic vote record
    //send sucess resonse with whole topicobject?
    Topics.findOne('email': email })
    let data = { test: 'test'}
    res.json(data)

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