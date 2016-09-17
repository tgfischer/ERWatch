var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HospitalSchema = new Schema({
  name        : String,
  street      : String,
  city        : String,
  postalCode  : String,
  province    : String
}, {
  collection : 'hospitals'
});

module.exports = mongoose.model('Hospital', HospitalSchema);
