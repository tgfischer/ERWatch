var express = require('express');
var async = require('async');
var Visit = require('../models/visit');

var Utils = {

  getQueue: function(next) {
    this.getVisitsBeingTreated(function(err, visitsBeingTreated) {
      if (err) {
        return next(err);
      }

      Visit.where('admitTime').equals(null).populate([ 'patient', 'condition' ]).exec(function(err, visits) {
        if (err) {
          return next(err);
        }

        visits = visits.sort(function(a, b) {
          return a.condition.severity < b.condition.severity;
        });

        if (visitsBeingTreated.length === 0 && visits.length > 0) {
          visits[0].admitTime = Date.now();

          Visit.update({ _id: visits[0]._id }, { admitTime: Date.now() }, function(err, visit) {
            if (err) {
              return next(err);
            }

            visits[0] = visit;

            return next(null, visits);
          });
        } else {
          return next(null, visits);
        }
      });
    });
  },

  getTimeUntilFinished: function(code, next) {
    Visit.findOne({ code: code }).populate([ 'patient', 'condition' ]).exec(function(err, visit) {
      if (err) {
        return next(err);
      }

      if (!visit.admitTime || visit.resolutionTime) {
        return next("This patient is not currently being treated");
      }

      return next(null, visit.waitTime - visit.getTimeDifference());
    });
  },

  getVisitsBeingTreated: function(next) {
    Visit.where('admitTime').ne(null).where('resolutionTime').equals(null).populate([ 'patient', 'condition' ]).exec(function(err, visits) {
      if (err) {
        return next(err);
      }

      async.each(visits, function(visit, callback) {
        visit.timeUntilFinished = visit.condition.waitTime - visit.getTimeDifference();
        callback();
      }, function(err) {
        if (err) {
          return next(err);
        }

        return next(null, visits);
      });
    });
  },

  getEstimatedWaitTime: function(code, next) {
    var _this = this;

    Visit.where('admitTime').equals(null).populate([ 'patient', 'condition' ]).exec(function(err, visits) {
      if (err) {
        return next(err);
      }

      var waitTime = 0;
      var visit;

      for (var i = 0; i < visits.length; i++) {
        if (visits[i].code === code) {
          visit = visits[i];
          break;
        }

        waitTime += visits[i].condition.waitTime;
      }

      _this.getVisitsBeingTreated(function(err, visitsBeingTreated) {
        if (err) {
          return next(err);
        }

        var treated = visitsBeingTreated.sort(function(a, b) {
          return a.waitTime - a.getTimeDifference() < b.waitTime - b.getTimeDifference();
        })[0];

        waitTime += treated.condition.waitTime - treated.getTimeDifference();

        return next(null, {
          waitTime: waitTime,
          visit: visit
        });
      });
    });
  },

  getQueueWithWaitTimes: function(next) {
    var _this = this;

    this.getQueue(function(err, queue) {
      if (err) {
        return next(err);
      }

      async.each(queue, function(visit, callback) {
        _this.getEstimatedWaitTime(visit.code, function(err, result) {
          visit.totalWaitTime = result.waitTime
          callback();
        });
      }, function(err) {
        if (err) {
          return next(err);
        }

        return next(null, queue);
      });
    });
  },

  markPatientAsTreated: function(code, next) {
    Visit.update({ code: code }, { resolutionTime: Date.now() },  function(err) {
      if (err) {
        return next(err);
      }

      return next();
    });
  }

}

module.exports = Utils;
