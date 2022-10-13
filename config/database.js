const mongoose = require("mongoose");
require("dotenv").config();

const conn = process.env.DB_STRING;

//connect to mongodb
const connection = mongoose.createConnection(conn, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Creates simple schema for a User.
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  admin: Boolean,
  hash: String,
  salt: String,
});

const User = connection.model("User", UserSchema);

module.exports = connection;
