var express = require('express');
var Patient = require('../../models/patient');
var Visit = require('../../models/visit');
var Condition = require('../../models/condition');
var Utils = require('../../utils/Utils');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('dashboard/addPatient');
});

router.post('/', function(req, res, next) {
  Condition.findOne({ name: req.body.conditionName }, function(err, condition) {
    if (err) {
      console.error(JSON.stringify(err, null, 2));

      return res.send({
        err : err,
        msg : "Uh oh, something went wrong! Please try again later."
      });
    }

    Utils.getVisitsBeingTreated(function(err, visitsBeingTreated) {
      var visit = new Visit();
      visit.code = Math.random().toString(36).substr(2, 8).toUpperCase();
      visit.arrivalTime = Date.now();

      if (!condition) {
        condition = new Condition();
        condition.name = req.body.conditionName;
        condition.waitTime = req.body.conditionWaitTime;
        condition.severity = req.body.conditionSeverity;
      }

      if (visitsBeingTreated.length === 0 || condition.severity > visitsBeingTreated[0].severity) {
        visit.admitTime = Date.now();
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

              visit.patient = patient._id;

              Visit.update({ _id: visit._id }, visit, function(err) {
                if (err) {
                  console.error(JSON.stringify(err, null, 2));
                  return res.send({
                    err : err,
                    msg : "Uh oh, something went wrong! Please try again later."
                  });
                }

                return res.send({ patient: patient });
              })
            });
          });
        });
      });
    });
  });
});

module.exports = router;
