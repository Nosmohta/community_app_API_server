"use strict";

const express     = require('express');
const router      = express.Router();
//const session     = require('express-session');
const request     = require('request');
const rpn         = require('request-promise-native');
const jwt         = require('jsonwebtoken');

require('dotenv').config();

//Bring needed models into scope.
const Users       = require("../database/models/Users");
const Topics      = require("../database/models/Topics");
const Conversations    = require("../database/models/Conversations");
const db_util          = require("../utilities/DB_helpers.js");


//POST conversation root
router.post("/", (req, res) => {
  let data = {}
  res.json(data);
});


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
      if(!data.entities[0]) {
        res.status(400).json({message: "Please provide a more complete description."})
      } else {
      const conversationPromise = db_util.convInitOrFind(conv_id, user_id);
      conversationPromise
        .then((conversation) => {
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
  const user_id = jwt.verify(req.body.token, process.env.APP_SECRET_KEY).id;
  const conv_id = req.body.conv_id;
  const subject = req.body.subject;

  // call nextQuestion(conversation) return next question object
  // push into conversation questions[]
  // respond with next question object

  Conversations.findOne( {'_id': conv_id})
    .then((conversation) => {
      const topic = new Topics({
        subject: subject,
        img_path: conversation.photo,
        up_votes: 0,
        down_votes: 0,
        description: conversation.description,
        nlp_data:{
          entities: conversation.nlp_data.entities,
          documentSentiment: conversation.nlp_data.documentSentiment,
          sentences: conversation.nlp_data.sentences,
          tokens: conversation.nlp_data.tokens,
        },
        vision_data:{
          labelAnnotations: conversation.vision_data.labelAnnotations,
          faceAnnotations: conversation.vision_data.faceAnnotations,
          safeSearchAnnotation: conversation.vision_data.safeSearchAnnotation,
          webDetection: conversation.vision_data.webDetection,
          fullTextAnnotation: conversation.vision_data.fullTextAnnotation,
        }
      })
      topic.save()
        .then( (topic) => {
          conversation.set( 'topic_id', topic.id)
          conversation.save()
            .then( () => {
              const questionPromise = db_util.nextQuestion(conversation, user_id);
              questionPromise
                .then( (question) => {
                  conversation.questions.push(question);
                  res.json({
                    question: question,
                    newTopic: "Insert new topic?"
                  });
                })
                .catch((err) => {
                  console.log(err)
                  res.status(400).json({'message': "Error generating next question."})
                })
            })
            .catch((err) => {
              console.log(err)
              res.status(400).json({'message': "Error saving conversation in database."})
            })
        })
        .catch(() => {
          res.status(400).json({'message': "Error saving topic in database."})
        })
    })
    .catch(() => {
      res.status(400).json({message: "Error finding conversation in database."})
    })
})



//POST conversation ANSWER
router.post("/answer", (req, res) => {
  const user_id = jwt.verify(req.body.token, process.env.APP_SECRET_KEY).id;
  const conv_id = req.body.conv_id;
  const answer = req.body.answer ? req.body.answer : '';

  console.log(conv_id, answer, user_id)
  Conversations.findOne( {'_id': conv_id})
    .then( (conversation) => {
        if( req.body.answer_type == 'COMMUNITY_TAG'){
          conversation.questions.push( req.body.answer_type )
          conversation.save()
            .then( () => {
              Topics.findOne({'_id': conversation.topic_id})
                .then( (topic) => {
                  topic.community_tags.push(answer)
                  topic.save()
                    .then(() => {
                      const questionPromise = db_util.nextQuestion(conversation, user_id);
                      questionPromise
                        .then((question) => {
                          conversation.questions.push(question);
                          res.json({
                            question: question
                          });
                        })
                        .catch(() => {
                          res.status(400).json({message: "Error generating next question."})
                        })

                    })
                    .catch(() => {
                      res.status(400).json({message: "Error setting tags."})
                    })

                })
                .catch(() => {
                  res.status(400).json({message: "Error finding topic."})
                })
            })
            .catch(() => {
            res.status(400).json({message: "Error saving conversation."})
             })

        } else {
          res.status(400).json({message: "Need to build logic to handle non-'community_tags' answers."})
        }

    })
    .catch(() => {
      res.status(400).json({message: "Error finding conversation in database."})
    })

});

module.exports = router;

