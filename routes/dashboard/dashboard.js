var express = require('express');
var Utils = require('../../utils/Utils');
var Auth = require('../../utils/Auth');
var router = express.Router();

/* GET home page. */
router.get('/', Auth.isLoggedIn, function(req, res, next) {
  Utils.getVisitsBeingTreated(function(err, visitsBeingTreated) {
    if (err) {
      console.log(JSON.stringify(err, null, 2));

      return res.send({
        err : err,
        msg : "Uh oh, something went wrong! Please try again later."
      });
    }

    Utils.getQueueWithWaitTimes(function(err, queue) {
      if (err) {
        console.log(JSON.stringify(err, null, 2));

        return res.send({
          err : err,
          msg : "Uh oh, something went wrong! Please try again later."
        });
      }
      
      res.render('dashboard/dashboard', {
        queue: queue,
        visitsBeingTreated: visitsBeingTreated
      });
    });
  });
});

router.post('/mark_treated', Auth.isLoggedIn, function(req, res, next) {
  Utils.markPatientAsTreated(req.body.code, function(err) {
    if (err) {
      console.log(JSON.stringify(err, null, 2));

      return res.send({
        err : err,
        msg : "Uh oh, something went wrong! Please try again later."
      });
    }

    res.send({ msg: "The patient was successfully marked as treated" });
  });
});

module.exports = router;
