"use strict";

var LocalStrategy = require("passport-local").Strategy;
var User = require("../models/Users");

module.exports = function (passport) {
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  passport.use("local-login", new LocalStrategy({
    usernameField: "username",
    passwordField: "password",
    passReqToCallback: true
  }, function (req, username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        console.log("no user found");
        req.flash("loginMessage", "Username not found");
        return done(null, false);
      }
      if (user) {
        console.log("user: " + user);
        if (user.validPassword(password, user.password)) {
          return done(null, user);
        } else {
          console.log("invalid password");
          req.flash("loginMessage", "Invalid Password");
          return done(null, false);
        }
      }
    });
  }));

  passport.use("local-signup", new LocalStrategy({
    usernameField: "username",
    passwordField: "password",
    passReqToCallback: true
  }, function (req, username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) {
        console.log("something went wrong");
        req.flash("signupMessage", "Something went wrong");
        return done(null, false);
      }
      if (user) {
        console.log("that user already exists");
        req.flash("signupMessage", "That user already exists");
        return done(null, false);
      } else {
        var info = req.body;
        var newUser = new User({
          firstname: info.firstname,
          lastname: info.lastname,
          username: info.username,
          password: info.password,
          email: info.email,
          admin: false
        });
        newUser.password = newUser.generateHash(info.password);
        newUser.save(function (error) {
          if (error) {
            console.log(error);
          }
          return done(null, newUser);
        });
      }
    });
  }));

  isLoggedIn = function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      console.log("user authenticated");
      next();
    } else {
      console.log("user not authenticated");
      res.redirect("/login");
    }
  };

  logoutUser = function logoutUser(req, res, next) {
    if (req.isAuthenticated()) {
      console.log("logged out successfully");
      req.logout();
      next();
    } else {
      next();
    }
  };

  isAdmin = function isAdmin(req, res, next) {
    if (req.isAuthenticated()) {
      console.log("user confirmed");
      if (req.user.admin) {
        console.log("Administer Confirmed");
        next();
      } else {
        console.log("you must be an administer to continue");
        res.redirect("/login");
      }
    } else {
      res.redirect("/login");
    }
  };
};