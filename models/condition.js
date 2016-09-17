var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ConditionSchema = new Schema({
  name        : String,
  waitTime    : Number,
  severity    : Number//,
  // visits      : [{ type: Schema.Types.ObjectId, ref: 'Visit' }]
}, {
  collections: 'conditions'
});

module.exports = mongoose.model('Condition', ConditionSchema);
