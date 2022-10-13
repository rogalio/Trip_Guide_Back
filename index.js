const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const crypto = require("crypto");
const MongoStore = require("connect-mongo")(session);
const Auth = require("./routes/Auth");
//tet
const connections = require("./config/database");
const User = connections.models.User;

const cors = require("cors");
require("dotenv").config();

// run express
const app = express();
const port = process.env.PORT;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// connect to mongodb
const dbstring = process.env.DB_STRING;
const dbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
const connection = mongoose.createConnection(dbstring, dbOptions);

// connect to session
const sessionStore = new MongoStore({
  mongooseConnection: connection,
  collection: "sessions",
});

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// require passport config
require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log(req.session);

  console.log(req.user, "user");

  next();
});

// routes
app.use(Auth);

app.get("/", (req, res) => {
  res.send("Hello !");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});