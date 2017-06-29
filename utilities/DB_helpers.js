"use strict";

const Users             = require("../database/models/Users");
const Topics            = require("../database/models/Topics");
const Conversations     = require("../database/models/Conversations");
const q                 = require("./questions");

// if the user has voted(up/down) on this topic return count
function userHistoryOnTopic( userVoteHistory, topicID, upVote){
  const hasHistory = (vote) => {
    return ((vote.topic_id == topicID) && (vote.up_vote === upVote ))
  }
  return userVoteHistory.some(hasHistory)
}


function convInitOrFind(conv_id, user_id) {
  if (!conv_id){
    return Conversations.create( {user_id: user_id})
      .then( ( conversation) => {
        return conversation
    })
  } else {
    return Conversations.findOne({'_id': conv_id})
      .then( (conversation) => {
        return conversation
    })
  }
}

function nextQuestion(conversation, user_id) {

  return Users.findOne({'_id': user_id})
            .then((user) => {
              let questionHistory = conversation.questions ? conversation.questions : []
              let question = {};
              //switch that calls specific generate question function
              switch (true) {
                case ((user.communities.length > 0) && (questionHistory.length == 0 )) :
                  question = q.askForCommunityTags(user.communities);
                  break;

                default:
                  question = {
                    type: 'END',
                    payload: { text: 'Thank you for contributing to your community!'}
                  }
              }
              return question
            })
            .catch((err) => {
              console.log(err);
              throw err
            })


}


// function addToConversation(user_id, newConvProps) {
//   console.log(req.file.filename )
//   console.log('conversation id: ', req.params.conversation_id);
//   console.log("conversation history: ", user.conversation_history[0]);
//   const conversation_init =  {
//     id: conv_id,
//     start_date: Date.now(),
//     update_date: Date.now(),
//     topic_id: '',
//     photo: photo_url,
//   };
//   let options = {
//     safe: true,
//     upsert: true,
//     new: true
//   };
//
//   Users.findByIdAndUpdate(user_id, {$push: {'conversation_history': conversation_init}}, options)
//     .then( (user) => {
//       console.log("user:", user.first_name)
//       user.conversation_history.forEach( (conv) => {console.log(conv)});
//       res.json({'message': 'Success'});
//     })
//     .catch()
//
// }



module.exports = {
  'userHistoryOnTopic': userHistoryOnTopic,
  //'addToConversation': addToConversation,
  'convInitOrFind': convInitOrFind,
  'nextQuestion': nextQuestion
}