"use strict";

const express     = require('express');
const router      = express.Router();
const session     = require('express-session');
const request     = require('request');
const jwt         = require('jsonwebtoken');
const multer      = require('multer');
const fs          = require('fs');
const uuid        = require('uuid/v1');
const rpn         = require('request-promise-native');

//Bring needed models into scope.
const Users       = require("../database/models/Users");
const Topics      = require("../database/models/Topics");
const db_util     = require("../utilities/DB_helpers.js");

require('dotenv').config();





//POST conversation photo
router.post("/conversations/photo", (req, res) => {
  let conv_id = req.body.conv_id;
  let user_id = jwt.verify(req.body.token, process.env.APP_SECRET_KEY).id;
  let photo_url = req.body.img

  console.log("in post to photo", "conv_id", conv_id, "user_id", user_id, "photo: ", photo_url);

  const conversationPromise = db_util.convInitOrFind(conv_id, user_id); //turn into promise structure

  conversationPromise
    .then((conversation) => {
      console.log(conversation)
      console.log("in post to photo", "conv_id", conv_id, "user_id", user_id, "photo: ", photo_url);

      const nlpOptions = {
        method: 'POST',
        uri: 'https://vision.googleapis.com/v1/images:annotate?key=' + process.env.GOOGLE_API_KEY,
        body: {
          "requests": [
            {
              "image": {
                "source": {
                  "imageUri": photo_url
                }
              },
              "features": [
                {
                  "type": "LABEL_DETECTION",
                  "maxResults": 5
                },
                {
                  "type": "SAFE_SEARCH_DETECTION",
                  "maxResults": 5
                },
                {
                  "type": "TEXT_DETECTION",
                  "maxResults": 5
                },
                {
                  "type": "WEB_DETECTION",
                  "maxResults": 5
                },
                {
                  "type": "FACE_DETECTION",
                  "maxResults": 5
                }

              ]
            }
          ]
        },
      json: true
      };
      rpn(nlpOptions)
        .then( (vision_data) => {
          const subject_guess_photo = vision_data.responses[0].labelAnnotations[0].description;
          conversation.set('photo', photo_url);
          conversation.set('subject_guess_photo', subject_guess_photo);
          conversation.set('vision_data.faceAnnotations', JSON.stringify(vision_data.responses[0].faceAnnotations));
          conversation.set('vision_data.labelAnnotations', JSON.stringify(vision_data.responses[0].labelAnnotations));
          conversation.set('vision_data.safeSearchAnnotation', JSON.stringify(vision_data.responses[0].safeSearchAnnotation));
          conversation.set('vision_data.webDetection', JSON.stringify(vision_data.responses[0].webDetection));
          conversation.set('vision_data.fullTextAnnotation', JSON.stringify(vision_data.responses[0].fullTextAnnotation));

          conversation.save()
            .then( () =>{
              res.json({
                message: "Successfully uploaded photo.",
                conv_id: conversation.id,
                subject_guess_photo: subject_guess_photo,
                vision_data: vision_data
              })
            })
            .catch( (err) => {
              console.log(err.message);
              res.status(401).json({message: "Error saving to database."})
            })
        })
        .catch( (err) => {
          console.log(err.message);
          res.status(401).json({message: "Error fetching from google vision API."})
        })
    })
    .catch( (err) => {
      console.log(err.message);
      res.status(401).json({message: "Photo upload error"})
    })
})


  //.then( save url, subject, sentiment, and vision data object to the database)
  //.then( after both are resolved, send back response



module.exports = router;

