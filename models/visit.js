var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VisitSchema = new Schema({
  code        : String,
  condition   : { type: String, ref: 'Condition' }
}, {
  collection: 'visits'
});

module.exports = mongoose.model('Visit', VisitSchema);
