const express = require("express");
const router = require("express").Router();
const passport = require("passport");
const generatePassword = require("../lib/passwordUtils").generatePassword;
const connection = require("../config/database");
const User = connection.models.User;
const isAuth = require("../routes/isAuthenticated").isAuth;
const isAdmin = require("../routes/isAuthenticated").isAdmin;

// login route with passport authentication
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      throw err;
    }
    if (!user) {
      res.send("No user exists");
    } else {
      req.logIn(user, (err) => {
        if (err) {
          throw err;
        }
        res.send("Successfully Authenticated");
        console.log(req.user);
      });
    }
  })(req, res, next);
});

// register route
router.post("/register", (req, res, next) => {
  const { username, password } = req.body;
  const { salt, hash } = generatePassword(password);

  const newUser = new User({
    email: username,
    admin: false,
    salt,
    hash,
  });

  newUser
    .save()
    .then(() => res.send("User created"))
    .catch((err) => res.send(err));
});

// protected route
router.get("/protected", isAuth, (req, res, next) => {
  res.json({ message: "You are authorized" });
});

// admin route
router.get("/admin", isAdmin, (req, res, next) => {
  res.status(401).json({ message: "You are authorized" });
});

// logout route
router.get("/logout", (req, res, next) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
