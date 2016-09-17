var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VisitSchema = new Schema({
  code            : String,
  arrivalTime     : Date,
  admitTime       : Date,
  resolutionTime  : Date,
  description     : String,
  totalWaitTime   : String,
  patient         : { type: Schema.Types.ObjectId, ref: 'Patient' },
  condition       : { type: String, ref: 'Condition' }
}, {
  collection: 'visits'
});

VisitSchema.methods.getTimeUntilFinished = function() {
  var diff = this.admitTime - Date.now();
  return diff > 0 ? (diff / 1000 / 60) << 0 : 0;
};

module.exports = mongoose.model('Visit', VisitSchema);
