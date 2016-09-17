var LocalStrategy = require('passport-local').Strategy;
var sanitizer = require('sanitizer');
var Nurse = require('../models/Nurse');
var Auth = require('../utils/Auth');

module.exports = function(passport) {

  // Used to serialize the nurse for the session
  passport.serializeUser(function (nurse, done) {
    done(null, nurse.id);
  });

  // Used to deserialize the nurse
  passport.deserializeUser(function (id, done) {
    Nurse.findById(id, function (err, nurse) {
      done(err, nurse);
    });
  });

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  passport.use('local-signup', new LocalStrategy({
    // By default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  }, function (req, email, password, done) {
    process.nextTick(function () {
      Nurse.find({ }, function(err, rows) {
        if (err) {
          return done(err);
        }

        // Get the next available ID. If the collection is empty, the id defaults to 0
        var newNurse = new Nurse();
        newNurse.firstName = sanitizer.sanitize(req.body.firstName);
        newNurse.lastName = sanitizer.sanitize(req.body.lastName);
        newNurse.email = sanitizer.sanitize(email);
        newNurse.password = newNurse.generateHash(sanitizer.sanitize(password));

        // Find a nurse whose email is the same as the forms email
        // We are checking to see if the nurse trying to login already exists
        Nurse.findOne({ 'email': newNurse.email }, function (err, nurse) {
          if (err) {
            return done(err);
          }

          // Check to see if theres already a nurse with that email
          if (nurse) {
            // Wait 3 seconds on wrong email, to deter brute force attacks
            return setTimeout(function() {
              return done(null, false, req.flash('message', 'That email is already taken.'));
            }, 3000);
          } else {
            // Save the nurse
            newNurse.save(function(err) {
              if (err) {
                throw err;
              }

              return done(null, newNurse);
            });
          }
        });
      });
    });
  }));

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  }, function (req, email, password, done) { // callback with email and password from our form
    // Find a nurse whose email is the same as the forms email
    // We are checking to see if the nurse trying to login already exists
    Nurse.findOne({ 'email': email }, function (err, nurse) {
      // If there are any errors, return the error before anything else
      if (err) {
        console.error(JSON.stringify(err, null, 2));
        return done(err);
      }

      // If no nurse is found, return the message
      if (!nurse) {
        // Wait 3 seconds on wrong email, to deter brute force attacks
        return setTimeout(function() {
          console.error('That nurse does not exist');
          return done(null, false, req.flash('message', 'That nurse does not exist'));
        }, 3000);
      }

      // If the nurse is found but the password is wrong
      if (!nurse.validatePassword(password)) {
        // Wait 3 seconds on wrong password, to deter brute force attacks
        return setTimeout(function() {
          console.error('Oops! Wrong password.');
          return done(null, false, req.flash('message', 'Oops! Wrong password.'));
        }, 3000);
      }

      // All is well, return successful nurse
      return done(null, nurse);
    });
  }));
};
