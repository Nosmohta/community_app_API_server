"use strict";

const PORT        = process.env.PORT || 8080;
const express     = require("express");
const bodyParser  = require("body-parser");
const mongoose   = require("mongoose");
const jwt = require('jsonwebtoken');
const passport = require("passport");
const passportJWT = require("passport-jwt");
const Users       = require("./database/models/Users")

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

const app         = express();

// mongoose connection
require('dotenv').config();
const dbuser = process.env.USERNAME;
const dbpass = process.env.PASSWORD;
const uri = "mongodb://" + dbuser + ":" + dbpass + "@ds127872.mlab.com:27872/communityapp2017";
mongoose.Promise = global.Promise;
const options = {server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
                replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };
mongoose.connect(uri, options);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

//Passport and JSON Web Token middleware
const jwtOptions = {}
  jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
  jwtOptions.secretOrKey = 'CommunitySecreteKey1234';
const strategy = new JwtStrategy(jwtOptions, (jwt_payload, next) => {
  console.log('payload received', jwt_payload);
  const user = Users.find({password: jwt_payload.id});
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});
passport.use(strategy);
app.use(passport.initialize());

// Seperated Routes for each Resource
const apiRoutes    = require("./routes/routes");
app.use(bodyParser.urlencoded({ extended: true }));

//Mount all resource routes
app.use("/api", apiRoutes);


app.post("/login", (req, res) => {
  if(req.body.email && req.body.password){
    const email = req.body.email.toLowerCase();
    const password = req.body.password;
    Users.findOne({'email': email })
    .then( (user) => {
      if( !user) {
        res.status(401).json({message:"No such user found."});
      }
      if( user && ( user.password === req.body.password)) {
        const payload = {id: user.id};
        const token = jwt.sign(payload, jwtOptions.secretOrKey);
        res.json({message: "Password OK.", token: token});
      } else {
        res.status(401).json({message:"Passwords did not match."});
      }
    })
    .catch( err => console.log(err))
  } else {
    res.status(401).json({message:"Password or username not provided."});
  }
});


app.listen(PORT, () => {
  console.log("Example app listening on port: " + PORT);
});

