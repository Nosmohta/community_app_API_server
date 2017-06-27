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
//?fields=entities
//POST conversation DESCRIPTION
router.post("/description", (req, res) => {
  let user_id = jwt.verify(req.body.token, process.env.APP_SECRET_KEY).id;
  const content = req.body.description;
  const nlpOptions = {
    method: 'POST',
    uri: 'https://language.googleapis.com/v1/documents:annotateText?fields=&key=' + process.env.GOOGLE_API_KEY,
    body:{
      document: {
        type: 'PLAIN_TEXT',
        language: 'EN',
        content: content
      },
      "features": {
        extractSyntax: true,
        extractEntities: true,
        extractDocumentSentiment: true
      },
      encodingType: 'UTF8'
    },
    json: true
  };
  rpn(nlpOptions)
    .then( (data) => {
      let conv_id = req.body.conv_id;
      console.log("data ", data);
      if(!data.entities[0]) {
        res.status(400).json({message: "Please provide a more complete description."})
      } else {
      const conversationPromise = db_util.convInitOrFind(conv_id, user_id);
      conversationPromise
        .then((conversation) => {
          console.log(conversation.id);
          conversation.set('description', content);
          conversation.set('subject_guess_nlp', JSON.stringify(data.entities[0].name) );
          conversation.set('nlp_data.documentSentiment',  JSON.stringify(data.documentSentiment));
          conversation.set("nlp_data.entities", JSON.stringify(data.entities) );
          conversation.set("nlp_data.sentences", JSON.stringify(data.documentSentiment) );
          conversation.set("nlp_data.tokens", JSON.stringify(data.tokens) );
          conversation.save()
            .then(() => {
              res.json({
                "data": data,
                'conv_id': conversation.id,
                'subject_guess_description': data.entities[0].name ? data.entities[0].name : ''
              });
            })
            .catch((err) => {
              res.status(401).json({message: "Error saving conversation", error: err})
            });
        })
        .catch((err) => {
          res.status(401).json({message: "Error on init or finding the conversation", error: err})
        });
      }

    })
    .catch( (err) => { res.status(401).json({ message:"Error fetching from NLP", error: err});});

});




//POST conversation SUBJECT
router.post("/subject", (req, res) => {
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

