var express = require('express');
var async = require('async');
var Visit = require('../models/visit');

var Utils = {

  getQueue: function(next) {
    var _this = this;

    Visit.where('admitTime').equals(null).populate([ 'patient', 'condition' ]).exec(function(err, visits) {
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

      return next(null, visit.condition.getAvgWaitTime() - visit.getTimeDifference());
    });
  },

  getVisitsBeingTreated: function(next) {
    Visit.where('admitTime').ne(null).where('resolutionTime').equals(null).populate([ 'patient', 'condition' ]).exec(function(err, visits) {
      if (err) {
        return next(err);
      }

      async.each(visits, function(visit, callback) {
        visit.timeUntilFinished = visit.condition.getAvgWaitTime() - visit.getTimeDifference();
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

    this.getQueue(function(err, visits) {
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

      _this.getVisitsBeingTreated(function(err, visitsBeingTreated) {
        if (err) {
          return next(err);
        }

        var treated = visitsBeingTreated.sort(function(a, b) {
          return a.condition.getAvgWaitTime() - a.getTimeDifference() < b.condition.getAvgWaitTime() - b.getTimeDifference();
        })[0];

        waitTime += treated.condition.getAvgWaitTime() - treated.getTimeDifference();

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
    var _this = this;
    Visit.update({ code: code }, { resolutionTime: Date.now() },  function(err) {
      if (err) {
        return next(err);
      }

      _this.getVisitsBeingTreated(function(err, visitsBeingTreated) {
        if (err) {
          next(err);
        }

        _this.getQueue(function(err, queue) {
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
  }

}

module.exports = Utils;
