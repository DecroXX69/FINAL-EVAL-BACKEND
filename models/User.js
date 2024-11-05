const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: function() { return this.isNewUser; },
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: function() { return this.isNewUser; },
    minlength: 6,
  },
  userType: { type: String, enum: ['regular', 'added'], default: 'regular' },
  addedBy: { type: String },
  addedByEmail:{type:String}
}, { timestamps: true });


userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


userSchema.methods.setIsNewUser = function (value) {
  this._isNewUser = value;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
