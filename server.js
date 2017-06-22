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
const bcrypt = require("bcrypt");
require('dotenv').config();

const app = express();

//MongoDB connection and configuration
const dbuser = process.env.USERNAME;
const dbpass = process.env.PASSWORD;
const uri = "mongodb://" + dbuser + ":" + dbpass + "@ds131312.mlab.com:31312/communityapp2017";
mongoose.Promise = global.Promise;
const options = {server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
                replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };
mongoose.connect(uri, options);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


app.use(bodyParser.urlencoded({ extended: true }));

//Passport and JSON Web Token middleware
const jwtOptions = {}
  jwtOptions.jwtFromRequest = ExtractJwt.fromBodyField('token');
  jwtOptions.secretOrKey = process.env.APP_SECRET_KEY;
const strategy = new JwtStrategy(jwtOptions, (jwt_payload, next) => {
  console.log('payload received', jwt_payload);
  const user = Users.findOne({'id': jwt_payload.id});
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});
passport.use(strategy);
app.use(passport.initialize());

//Allow for CORS in Development
app.use( (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//Mount all resource routes
const apiRoutes    = require("./routes/routes");
app.use("/api", passport.authenticate('jwt', { session: false }),  apiRoutes);


//USER LOGIN ROUTE
app.post("/login", (req, res) => {

  if(req.body.email && req.body.password){
    const email = req.body.email.toLowerCase();
    const password = req.body.password;
    Users.findOne({'email': email })
    .then( (user) => {
      if( !user) {
        res.status(401).json({message:"No such user found."});
      } else if( user && (bcrypt.compareSync(  password, user.password))) {
        const payload = {id: user.id};
        const token = jwt.sign(payload, jwtOptions.secretOrKey);
        res.json({message: "Password OK.", token: token});
      } else {
        console.log(user.password);
        console.log(password);
        res.status(401).json({message:"Passwords did not match."});
      }
    })
    .catch( err => console.log(err))
  }
  if (!req.body.email || !req.body.password) {
    res.status(401).json({message:"Password or username not provided."});
  }
});

// REGISTER ROUTE
app.post("/register", (req, res) => {
  let hashPassword = bcrypt.hashSync(req.body.password, 10);
  const user = {
    first_name: req.body.firstname,
    last_name: req.body.lastname,
    email: req.body.email,
    password: hashPassword
  };
  if( user.first_name && user.last_name && user.email && hashPassword){
    Users.create(user)
      .then((response) => {
        const payload = {id: response.id};
        const token = jwt.sign(payload, jwtOptions.secretOrKey);
        res.json({
          message: "Register Success from server",
          token: token
        })
      })
      .catch(err => {
        console.log(err.errors.email.kind);
        if(err.errors.email.kind === 'unique') {
          res.status(401).json({message: "That email is already used."})
        } else {
          res.status(401).json({message: "Registration has failed at the server."})
        }
      })
  } else {
    res.status(401).json({message: "Please complete all registration fields"})
  }
});



app.listen(PORT, () => {
  console.log("Example app listening on port: " + PORT);
});

