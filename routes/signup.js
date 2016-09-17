var express = require('express');
var passport = require('passport');
var Hospital = require('../models/hospital');
var Auth = require('../utils/Auth');
var router = express.Router();

// GET /signup
router.get('/', Auth.isLoggedOut, function(req, res, next) {
  Hospital.find({ }, function(err, hospitals) {
    if (err) {
      return res.send({ err: err });
    }
    res.render('signup', {
      message: req.flash('message'),
      hospitals: hospitals
    });
  });
});

// POST /signup
router.post('/', Auth.isLoggedOut, passport.authenticate('local-signup', {
  successRedirect : '/',
  failureRedirect : '/signup',
  failureFlash : true
}));

module.exports = router;
