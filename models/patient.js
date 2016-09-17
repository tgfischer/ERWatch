var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PatientSchema = new Schema({
  firstName   : String,
  lastName    : String,
  gender      : String,
  birthday    : Date,
  healthCard  : String,
  visits      : [{ type: Schema.Types.ObjectId, ref: 'Visit' }]
}, {
  collection: 'patients'
});

module.exports = mongoose.model('Patient', PatientSchema);
