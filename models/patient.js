var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PatientSchema = new Schema({
  firstName   : String,
  lastName    : String,
  severity    : Number,
  code        : String,
  condition   : { type: String, ref: 'Condition' }
}, {
  collection: 'patients'
});

module.exports = mongoose.model('Patient', PatientSchema);
