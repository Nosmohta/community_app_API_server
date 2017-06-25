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


//configure Multer upload middleware
//need limit filter and type filter
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + uuid() +'.jpg')
  }
})
const uploadPhoto = multer({storage: storage}).single('img');


//Get Photos Route
router.get("/photos/:photo_id", (req, res) => {
  // don't trust req.params
  // read topic_5.jpg from uploads file
  let img_name = req.params.photo_id;
  let photo = __dirname + '/../uploads/' + img_name;
  console.log(photo.filename);
  res.download(photo);
});


//POST conversation photo
router.post("/conversations/:conversation_id/photo", uploadPhoto , (req, res) => {

  let conv_id = req.params.conversation_id;
  console.log(req.body);
  let user_id = jwt.verify(req.body.token, process.env.APP_SECRET_KEY).id;
  let photo_url = 'http://localhost:8080/upload/photos/' + req.file.filename ;

  Users.findOne({'_id': user_id})
    .then( (user) => {
      //2. google vision api call:
      //need to async read file to data and then to api call....
      fs.readFile( __dirname + '/../uploads/topic_5.jpg', 'utf8', (err, data) => {
        if(err) {console.log(err)};

        console.log("data now available....", 'data');

        const nlpOptions = {
          method: 'POST',
          uri: 'https://vision.googleapis.com/v1/images:annotate&key=' + process.env.GOOGLE_API_KEY,
          body:{
            "requests":[
              {
                "image":{
                  "content": "content"
                },
                "features":[
                  {
                    "type": data,
                    "maxResults":10
                  }
                ]
              }
            ]
          },
          json: true
        };

        rpn(nlpOptions)
          .then( (vision_data) => {

            console.log("data from Vision processing", 'vision_data')

            // 3. add a conversation {photo: file_path} to users conversation history[].
            const conversation_init =  {
              conversation_id: conv_id,
              start_date: Date.now(),
              update_date: Date.now(),
              photo: photo_url,
            };
            let options = {
              safe: true,
              upsert: true,
              new: true
            };
            Users.findByIdAndUpdate(user_id, {$push: {'conversation_history': conversation_init}}, options)
              .then( (user) => {
                console.log("user:", user.first_name)
                res.json({'message': 'Success'});
              })
              .catch( (err) => {
                console.log(err.message );
                res.status(402).json({message: 'Update conversation history DB error'});
              });

          })
          .catch( (err) => {
            console.log(err.message );
            res.status(402).json({message: 'vision API ERR'});
          });

      })

    })
    .catch( (err) => {
      console.log(err);
      //delete uploaded file and end()?
      res.status(402).json({message: 'Invalid web token. Please login again.'});
    })



});


module.exports = router;

