var express = require('express');
var Hospital = require('../models/hospital');
var Utils = require('../utils/Utils');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  Hospital.find({  }, function(err, hospitals) {
    if (err) {
      return res.json({ err: err });
    }

    Utils.getWaitTimeForHospital(hospitals[0], function(err, result) {
      if (err) {
        return res.json({ err: err });
      }

      res.render('index', {
        hospitals: hospitals,
        waitTime: result.waitTime
      });
    });
  });
});

router.post('/get_wait_time', function(req, res, next) {
  Hospital.findOne({ _id: req.body.hospitalId }, function(err, hospital) {
    if (err) {
      return res.json({ err: err });
    }

    Utils.getWaitTimeForHospital(hospital, function(err, result) {
      if (err) {
        return res.json({ err: err });
      }

      res.send({ waitTime: result.waitTime });
    });
  });
});

module.exports = router;
