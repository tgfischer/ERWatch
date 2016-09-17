var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ConditionSchema = new Schema({
  name        : String,
  category    : String,
  waitTime    : Number,
  patients    : [{ Schema.Types.ObjectId, ref: 'Patient' }]
}, {
  collections: 'conditions'
});

module.exports = mongoose.model('Condition', ConditionSchema);
