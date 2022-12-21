const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
//google strategy
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const connection = require("./database");
const User = connection.models.User;
const validatePassword = require("../lib/passwordUtils").validatePassword;
require("dotenv").config();

const googleParams = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:4000/auth/google/callback",
};

// verify callback with email & password
const verifyCallback = (username, password, done) => {
  User.findOne({ email: username }, (err, user) => {
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

// verify callback with google
const verifyCallbackGoogle = (accessToken, refreshToken, profile, done) => {
  User.findOne({ googleId: profile.id }, async (err, user) => {
    if (err) {
      return done(err);
    }
    if (user) {
      console.log("user found");
      return done(null, user);
    } else {
      const newUser = new User({
        googleId: profile.id,
        admin: false,
        email: profile?._json.email,
        accountInfo: {
          email: profile?._json?.email,
          firstName: profile?._json?.given_name,
          lastName: profile?._json?.family_name,
          avatar: profile?._json?.picture,
        },
      });
    
      console.log("new user created");
      await newUser.save((err) => {
        if (err) {
          return done(err);
        }
        return done(null, newUser);
      });
    }
  });
};

// email + password Passport strategy
const strategyWithEmailAndPassword = new LocalStrategy(verifyCallback);
passport.use(strategyWithEmailAndPassword);

// google Passport strategy
const strategyWithGoogle = new GoogleStrategy(
  googleParams,
  verifyCallbackGoogle
);
passport.use(strategyWithGoogle);

// populate user.Id
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// depopulate user.id
passport.deserializeUser((userId, done) => {
  try {
    User.findById(userId, (err, user) => {
      done(err, user);
    });
  } catch (error) {
    done(error);
  }
});
