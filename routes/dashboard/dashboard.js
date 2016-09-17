var express = require('express');
var Utils = require('../../utils/Utils');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  Utils.getVisitsBeingTreated(function(err, visitsBeingTreated) {
    if (err) {
      console.log(JSON.stringify(err, null, 2));

      return res.send({
        err : err,
        msg : "Uh oh, something went wrong! Please try again later."
      });
    }

    Utils.getQueue(function(err, queue) {
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

module.exports = router;
