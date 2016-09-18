var express = require('express');
var async = require('async');
var Visit = require('../models/visit');

var Utils = {

  getQueue: function(hospitalId, next) {
    var _this = this;

    Visit.find({ hospital: hospitalId }).where('admitTime').equals(null).populate([ 'patient', 'condition' ]).exec(function(err, visits) {
      if (err) {
        return next(err);
      }

      visits = visits.sort(function(a, b) {
        return a.condition.severity < b.condition.severity;
      });

      return next(null, visits);
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

      var timeUntilFinished = visit.condition.getAvgWaitTime() - visit.getTimeDifference();
      return next(null, timeUntilFinished > 0 ? timeUntilFinished : 0);
    });
  },

  getVisitsBeingTreated: function(hospitalId, next) {
    Visit.find({ hospital: hospitalId }).where('admitTime').ne(null).where('resolutionTime').equals(null).populate([ 'patient', 'condition' ]).exec(function(err, visits) {
      if (err) {
        return next(err);
      }

      async.each(visits, function(visit, callback) {
        var timeUntilFinished = visit.condition.getAvgWaitTime() - visit.getTimeDifference();
        visit.timeUntilFinished = timeUntilFinished > 0 ? timeUntilFinished : 0;
        callback();
      }, function(err) {
        if (err) {
          return next(err);
        }

        return next(null, visits);
      });
    });
  },

  getEstimatedWaitTime: function(code, hospitalId, next) {
    var _this = this;

    this.getQueue(hospitalId, function(err, visits) {
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

        waitTime += visits[i].condition.getAvgWaitTime();
      }

      _this.getVisitsBeingTreated(hospitalId, function(err, visitsBeingTreated) {
        if (err) {
          return next(err);
        }

        var treated = visitsBeingTreated.sort(function(a, b) {
          return a.condition.getAvgWaitTime() - a.getTimeDifference() < b.condition.getAvgWaitTime() - b.getTimeDifference();
        })[0];

        waitTime += treated.condition.getAvgWaitTime() - treated.getTimeDifference();

        return next(null, {
          waitTime: waitTime > 0 ? waitTime : 0,
          visit: visit
        });
      });
    });
  },

  getQueueWithWaitTimes: function(hospitalId, next) {
    var _this = this;

    this.getQueue(hospitalId, function(err, queue) {
      if (err) {
        return next(err);
      }

      async.each(queue, function(visit, callback) {
        _this.getEstimatedWaitTime(visit.code, hospitalId, function(err, result) {
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

  markPatientAsTreated: function(code, hospitalId, next) {
    var _this = this;
    Visit.update({ code: code }, { resolutionTime: Date.now() },  function(err) {
      if (err) {
        return next(err);
      }

      _this.getVisitsBeingTreated(hospitalId, function(err, visitsBeingTreated) {
        if (err) {
          next(err);
        }

        _this.getQueue(hospitalId, function(err, queue) {
          if (err) {
            next(err);
          }

          if (visitsBeingTreated.length === 0 && queue.length > 0) {
            Visit.update({ _id: queue[0]._id }, { admitTime: Date.now() }, function(err) {
              if (err) {
                return next(err);
              }

              return next();
            });
          } else {
            return next();
          }
        });
      });
    });
  },

  getWaitTimeForHospital: function(hospitalId, next) {
    var _this = this;

    this.getQueue(hospitalId, function(err, visits) {
      if (err) {
        return next(err);
      }

      var waitTime = 0;
      var visit;

      for (var i = 0; i < visits.length; i++) {
        waitTime += visits[i].condition.getAvgWaitTime();
      }

      _this.getVisitsBeingTreated(hospitalId, function(err, visitsBeingTreated) {
        if (err) {
          return next(err);
        }

        if (visitsBeingTreated.length > 0) {
          var treated = visitsBeingTreated.sort(function(a, b) {
            return a.condition.getAvgWaitTime() - a.getTimeDifference() < b.condition.getAvgWaitTime() - b.getTimeDifference();
          })[0];

          waitTime += treated.condition.getAvgWaitTime() - treated.getTimeDifference();
        }

        return next(null, {
          waitTime: waitTime > 0 ? waitTime : 0,
          visit: visit
        });
      });
    });
  }

}

module.exports = Utils;
