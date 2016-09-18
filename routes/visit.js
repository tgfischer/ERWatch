var express = require('express');
var Utils = require('../utils/Utils');
var router = express.Router();

/* GET home page. */
router.get('/:code', function(req, res, next) {
  Utils.getEstimatedWaitTime(req.params.code, req.user.hospital, function(err, result) {
    if (err) {
      console.log(err);
      res.send({ err: err })
    }

    if (result.visit) {
      var expectedDate = new Date();
      expectedDate = new Date(expectedDate.getTime() + result.waitTime * 60000).toLocaleTimeString('en-US', {
        hour: "2-digit",
        minute: "2-digit"
      });

      return res.render('visit', {
        patient: result.visit.patient,
        waitTime: result.waitTime,
        visit: result.visit,
        condition: result.visit.condition,
        expectedDate: expectedDate
      });
    } else {
      return res.render('visit', {
        msg: 'This visitor has already been seen by a doctor'
      });
    }
  });
});

module.exports = router;
