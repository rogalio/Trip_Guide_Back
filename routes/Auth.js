const express = require("express");
const router = require("express").Router();
const passport = require("passport");
const generatePassword = require("../lib/passwordUtils").generatePassword;
const connection = require("../config/database");
const User = connection.models.User;
const isAuth = require("../routes/isAuthenticated").isAuth;
const isAdmin = require("../routes/isAuthenticated").isAdmin;

// login route with email & password  authentication
router.post("/login", (req, res, next) => {
  try {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res
          .status(400)
          .json({ message: "Incorrect username or password" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.status(200).json({ message: "Login successful" });
      });
    })(req, res, next);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

// login with google route
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    successRedirect: "/",
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

// register route
router.post("/register", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const { salt, hash } = generatePassword(password);
    const user = await User.findOne({ email: username });

    if (!username || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    } else {
      const newUser = new User({
        email: username,
        admin: false,
        salt,
        hash,
      });

      await newUser
        .save()
        .then(() => res.status(200).json({ message: "User created" }))
        .catch((err) => res.send(err));
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
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
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
