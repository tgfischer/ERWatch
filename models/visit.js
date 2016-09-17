var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VisitSchema = new Schema({
  code              : String,
  arrivalTime       : Date,
  admitTime         : Date,
  resolutionTime    : Date,
  description       : String,
  totalWaitTime     : String,
  timeUntilFinished : String,
  patient           : { type: Schema.Types.ObjectId, ref: 'Patient' },
  condition         : { type: String, ref: 'Condition' }
}, {
  collection: 'visits'
});

VisitSchema.methods.getTimeDifference = function() {
  var diff = Date.now() - this.admitTime;
  return diff > 0 ? ((diff / 1000 / 60) << 0) : 0;
};

module.exports = mongoose.model('Visit', VisitSchema);
