"use strict";

const Users             = require("../database/models/Users");
const Topics            = require("../database/models/Topics");
const Conversations     = require("../database/models/Conversations");


function askForCommunityTags(user_communities) {

  return {
    type: "COMMUNITY_TAG",
    payload: {
      text: "Would you like to associate this topic with one of your communities?",
      user_communities: user_communities
    }
  }
}



module.exports = {
  'askForCommunityTags': askForCommunityTags
}