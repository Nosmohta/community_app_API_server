"use strict";

const express     = require('express');
const router      = express.Router();
const session     = require('express-session');
const request     = require('request');

//Bring needed models into scope.
const Users       = require("../database/models/Users");
const Topics      = require("../database/models/Topics");
const db          = require("../utilities/DB_helpers.js")

//Token and security
const jwt         = require('jsonwebtoken');
const bcrypt = require("bcrypt");
require('dotenv').config();







//USER LOGIN ROUTE
router.post("/login", (req, res) => {
  if(req.body.email && req.body.password){
    const email = req.body.email.toLowerCase();
    const password = req.body.password;
    Users.findOne({'email': email })
      .then( (user) => {
        if( !user) {
          res.status(401).json({message:"No such user found."});
        } else if( user && (bcrypt.compareSync(  password, user.password))) {
          const payload = {id: user.id};
          const token = jwt.sign(payload, process.env.APP_SECRET_KEY);
          res.json({message: "Password OK.", token: token});
        } else {
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
router.post("/register", (req, res) => {
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
        const token = jwt.sign(payload, process.env.APP_SECRET_KEY);
        res.json({
          message: "Register Success from server",
          token: token
        })
      })
      .catch(err => {
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


module.exports = router;