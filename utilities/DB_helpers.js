
// if the user has voted(up/down) on this topic return count
function userHistoryOnTopic( userVoteHistory, topicID, upVote){
  const hasHistory = (vote) => {
    return ((vote.topic_id == topicID) && (vote.up_vote === upVote ))
  }
  return userVoteHistory.some(hasHistory)
}

module.exports = {'userHistoryOnTopic': userHistoryOnTopic}