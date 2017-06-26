


// if the user has voted(up/down) on this topic return count
function userHistoryOnTopic( userVoteHistory, topicID, upVote){

  const hasHistory = (vote) => {
    return ((vote.topic_id == topicID) && (vote.up_vote === upVote ))
  }
  return userVoteHistory.some(hasHistory)
}




function addToConversation(user_id, newConvProps) {

  console.log(req.file.filename )
  console.log('conversation id: ', req.params.conversation_id);
  console.log("conversation history: ", user.conversation_history[0]);

  const conversation_init =  {
    id: conv_id,
    start_date: Date.now(),
    update_date: Date.now(),
    topic_id: '',
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
      user.conversation_history.forEach( (conv) => {console.log(conv)});
      res.json({'message': 'Success'});
    })
    .catch()

}



module.exports = {
  'userHistoryOnTopic': userHistoryOnTopic,
  'addToConversation': addToConversation
}