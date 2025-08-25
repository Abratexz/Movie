const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    maxlength: 100
  },
  userpassword: {
    type: String,
    required: true,
    maxlength: 255,
    validate: {
      validator: function (value) {
        // ความยาวต้อง 5-8 ตัว และห้ามมี $, #, @
        const isValidLength = value.length >= 5 && value.length <= 8;
        const hasForbiddenChars = /[$#@]/.test(value);
        return isValidLength && !hasForbiddenChars;
      },
      message: props => `รหัสผ่านต้องมีความยาว 5-8 ตัวอักษร และห้ามมีอักขระ $, #, @ (คุณกรอก: "${props.value}")`
    }
  },
  joindate: {
    type: Date,
    default: Date.now
  },
  expirationdate: {
    type: Date
  },
  email: {
    type: String,
    required: [true, 'กรุณาระบุอีเมล'],
    lowercase: true,
    unique: true,
    validate: {
      validator: function (value) {
        // ใช้ regex ตรวจรูปแบบ email (built-in วิธีง่าย)
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: 'รูปแบบอีเมลไม่ถูกต้อง'
    }
  },

});

module.exports = mongoose.model('User', userSchema);
