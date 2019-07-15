const express = require("express");
const authRoutes = express.Router();
const passport = require("passport");
// const ensureLogin = require("connect-ensure-login");
const bcryptjs = require("bcryptjs");
const User = require("../models/User");

const bcryptSalt = 10;

authRoutes.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

authRoutes.post("/signup", (req, res, next) => {
  const username = req.body.username;

  const password = req.body.password;

  if (username === "" || password === "") {
    res.render("auth/signup", {
      message: "Indicate username and password"
    });

    return;
  }

  User.findOne({
    username
  })

    .then(user => {
      if (user !== null) {
        res.render("auth/signup", {
          message: "The username already exists"
        });

        return;
      }

      const salt = bcryptjs.genSaltSync(bcryptSalt);
      const hashPass = bcryptjs.hashSync(password, salt);
      const newUser = new User({
        username,

        password: hashPass
      });

      newUser.save(err => {
        if (err) {
          res.render("auth/signup", {
            message: "Something went wrong"
          });
        } else {
          res.redirect("/login");
        }
      });
    })

    .catch(error => {
      next(error);
    });
});

authRoutes.get("/login", (req, res, next) => {
  res.render("auth/login", { message: req.flash("error") });
});

authRoutes.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/plus.login",
      "https://www.googleapis.com/auth/plus.profile.emails.read"
    ]
  })
);

authRoutes.get("/auth/google/callback",  passport.authenticate
("google", {
    failureRedirect: "/",
    successRedirect: "/private-page"
  })
);

authRoutes.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/private-page",
    failureRedirect: "/login",
    failureFlash: true,
    passReqToCallback: true
  })
);

authRoutes.get("/auth/github", passport.authenticate("github"));

authRoutes.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/private-page");
  }
);


  authRoutes.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/login");
  });

module.exports = authRoutes;
// authRoutes.get("/private-page", ensureLogin.ensureLoggedIn(), (req, res) => {
//   res.render("private", {
//     user: req.user
//   });
// });