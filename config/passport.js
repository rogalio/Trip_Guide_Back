const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const connection = require("./database");
const User = connection.models.User;
const validatePassword = require("../lib/passwordUtils").validatePassword;

const verifyCallback = (username, password, done) => {
  User.findOne({ username }, (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false, { message: "Incorrect username" });
    }
    const isValid = validatePassword(password, user.hash, user.salt);
    if (isValid) {
      return done(null, user);
    } else {
      return done(null, false, { message: "Incorrect password" });
    }
  });
};

const strategy = new LocalStrategy(verifyCallback);
passport.use(strategy);

// populate user.Id
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((userId, done) => {
  try {
    User.findById(userId, (err, user) => {
      done(err, user);
    });
  } catch (error) {
    done(error);
  }
});
