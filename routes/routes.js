"use strict";

const express     = require('express');
const router      = express.Router();
const session     = require('express-session')

//Bring needed models into scope.
const Users       = require("../database/models/Users")


  router.get("/", (req, res) => {
    let data = {}
    res.json(data);
  });

  router.get("/users", (req, res) => {
    Users.find({first_name:'andrew'})
        .then((data) => res.json(data))
        .catch((err) => console.log(err))
  });


module.exports = router