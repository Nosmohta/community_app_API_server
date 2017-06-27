'use strict'

const mongoose   = require("mongoose");

const conversationSchema = mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'topic' },
    photo: String,
    photo_safe: Boolean,
    vision_data:{
      labelAnnotations: String,
      faceAnnotations: String,
      safeSearchAnnotation: String,
      webDetection: String,
      fullTextAnnotation: String,
    },
    description: String,
    nlp_data:{
      entities: String,
      documentSentiment: String,
      sentences: String,
      tokens: String,
    },
    subject: String,
    subject_guess_photo: String,
    subject_guess_nlp: String
  },
  {
    timestamps: {
      createdAt: 'created_at'
    }
  }

);

module.exports = conversationSchema;


{

}