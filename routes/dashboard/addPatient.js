var express = require('express');
var Patient = require('../../models/patient');
var Visit = require('../../models/visit');
var Condition = require('../../models/condition');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('dashboard/addPatient');
});

router.post('/', function(req, res, next) {
  console.log(req.body.healthCard);
  Condition.findOne({ name: req.body.conditionName }, function(err, condition) {
    if (err) {
      console.error(JSON.stringify(err, null, 2));
      return res.send({
        err : err,
        msg : "Uh oh, something went wrong! Please try again later."
      });
    }

    var visit = new Visit();
    visit.code = Math.random().toString(36).substr(2, 8).toUpperCase();

    if (!condition) {
      condition = new Condition();
      condition.name = req.body.conditionName;
      condition.waitTime = req.body.conditionWaitTime;
      condition.severity = req.body.conditionSeverity;
    }

    condition.save(function(err) {
      if (err) {
        console.error(JSON.stringify(err, null, 2));

        return res.send({
          err : err,
          msg : "Uh oh, something went wrong! Please try again later."
        });
      }

      visit.condition = condition._id;

      visit.save(function(err) {
        if (err) {
          console.error(JSON.stringify(err, null, 2));

          return res.send({
            err : err,
            msg : "Uh oh, something went wrong! Please try again later."
          });
        }

        Patient.findOne({ healthCard: req.body.healthCard }, function(err, patient) {
          if (err) {
            console.error(JSON.stringify(err, null, 2));
            return res.send({
              err : err,
              msg : "Uh oh, something went wrong! Please try again later."
            });
          }

          if (!patient) {
            patient = new Patient();
            patient.firstName = req.body.firstName;
            patient.lastName = req.body.lastName;
            patient.gender = req.body.gender;
            patient.birthday = req.body.birthday;
            patient.healthCard = req.body.healthCard;
            patient.visits = [];
          }

          patient.visits.push(visit);

          patient.save(function(err) {
            if (err) {
              console.error(JSON.stringify(err, null, 2));
              return res.send({
                err : err,
                msg : "Uh oh, something went wrong! Please try again later."
              });
            }

            console.log(JSON.stringify(patient, null, 2));
            return res.send({ patient: patient });
          });
        });
      });
    });
  });
});

module.exports = router;
