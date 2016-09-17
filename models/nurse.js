var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var NurseSchema = new Schema({
  firstName : String,
  lastName  : String,
  email     : String,
  password  : String
}, {
  collection : 'nurses'
});

NurseSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

NurseSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('Nurse', NurseSchema);
