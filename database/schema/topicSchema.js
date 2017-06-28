'use strict'

const mongoose   = require("mongoose");

const topicSchema = mongoose.Schema({
    subject: String,
    img_path: String,
    up_votes: Number,
    down_votes: Number,
    description: String,
    community_tags:[],
    nlp_data:{
      entities: String,
      documentSentiment: String,
      sentences: String,
      tokens: String,
    },
    vision_data:{
      labelAnnotations: String,
      faceAnnotations: String,
      safeSearchAnnotation: String,
      webDetection: String,
      fullTextAnnotation: String,
    }
  },
  {
    timestamps: {
      createdAt: 'created_at'
    }
  });

module.exports = topicSchema;



