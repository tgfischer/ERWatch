var express = require('express');
var Utils = require('../utils/Utils');
var Visit = require('../models/visit');
var router = express.Router();

/* GET home page. */
router.get('/:code', function(req, res, next) {
  Visit.findOne({ code: req.params.code }, function(err, visit) {
    if (err) {
      console.log(err);
      res.send({ err: err })
    }

    // console.log(JSON.stringify(hospital, null,));

    Utils.getEstimatedWaitTime(req.params.code, visit.hospital, function(err, result) {
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
});

module.exports = router;
