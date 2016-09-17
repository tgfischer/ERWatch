var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ConditionSchema = new Schema({
  name        : String,
  waitTime    : [Number],
  severity    : Number
}, {
  collections: 'conditions'
});

ConditionSchema.methods.getAvgWaitTime = function() {
  var sum = 0;

  for (var i = 0; i < this.waitTime.length; i++) {
    sum += this.waitTime[i];
  }

  return Math.round(sum / this.waitTime.length);
}

module.exports = mongoose.model('Condition', ConditionSchema);
