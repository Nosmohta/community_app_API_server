// run this file to seed the database with sample data: empty database first.
const mongoose = require("mongoose");
require('dotenv').config();

//Import Schemas
const userSchema = require('../Schema/userSchema')


const dbuser = process.env.USERNAME;
const dbpass = process.env.PASSWORD;


const uri = "mongodb://" + dbuser + ":" + dbpass + "@ds127872.mlab.com:27872/communityapp2017";

console.log(uri)

mongoose.Promise = global.Promise;

const options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
                replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };

mongoose.connect(uri, options);

const db = mongoose.connection;


db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', () => {

  // Create User schema
  //const userSchema = mongoose.Schema(userSchema);

  // Store User documents in a collection called "users"
  const User = mongoose.model('users', userSchema);

  // Create seed data
  const user_1 = new User({
    first_name: "rich",
    last_name: "forester",
    email: "rich@email.com",
    password: "1234"
  });

  const user_2 = new User({
    first_name: "andrew",
    last_name: "thomson",
    email: "andrew@email.com",
    password: "1234"
  });

  /*
   * Insert Users into User Collection
   */
  const userList = [user_1, user_2]
  User.insertMany(userList);

});

