"use strict";

const PORT        = process.env.PORT || 8080;
const express     = require("express");
const bodyParser  = require("body-parser");
const mongoose    = require("mongoose");
const jwt         = require('jsonwebtoken');
const passport    = require("passport");
const passportJWT = require("passport-jwt");
const multer      = require('multer');
const upload      = multer();

const ExtractJwt  = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
require('dotenv').config();
const Users       = require("./database/models/Users");

const app         = express();

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

//Allow for CORS in Development
app.use( (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));


//Passport and JSON Web Token middleware
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromBodyField('token'),
  secretOrKey: process.env.APP_SECRET_KEY
};
const strategy = new JwtStrategy(jwtOptions, (jwt_payload, next) => {
  const user = Users.findOne({'id': jwt_payload.id});
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});
passport.use(strategy);
app.use(passport.initialize());


//Mount all resource routes
const conversationsRoutes    = require("./routes/conversationsRoutes");
const topicsRoutes           = require("./routes/topicsRoutes");
const uploadRoutes           = require("./routes/uploadRoute");
const publicRoutes           = require("./routes/userRoutes");
app.use("/api/conversations", passport.authenticate('jwt', { session: false }),  conversationsRoutes);
app.use("/api/topics", passport.authenticate('jwt', { session: false }),  topicsRoutes);
app.use("/upload",passport.authenticate('jwt', { session: false }), uploadRoutes);
app.use("/", publicRoutes);


app.listen(PORT, () => {
  console.log("Example app listening on port: " + PORT);
});

