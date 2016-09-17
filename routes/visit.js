var express = require('express');
var Utils = require('../utils/Utils');
var router = express.Router();

/* GET home page. */
router.get('/:code', function(req, res, next) {
  Utils.getEstimatedWaitTime(req.params.code, function(err, result) {
    if (err) {
      console.log(err);
      res.send({ err: err })
    }

    if (result.visit) {
      return res.render('visit', {
        firstName: result.visit.patient.firstName,
        lastName: result.visit.patient.lastName,
        waitTime: result.waitTime,
        arrivalTime: result.visit.admitTime,
        conditionName: result.visit.condition.name
      });
    } else {
      return res.render('visit', {
        msg: 'This visitor has already been seen by a doctor'
      });
    }
  });
});

module.exports = router;
