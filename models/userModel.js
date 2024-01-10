const mongoose = require('mongoose');
const validator = require('validator');

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!'],
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // This only works on CREATE and SAVE!!!
            validator: function (el) {
                //---return kieu673 booleen true || false
                return el === this.password;
            },
            message: 'Passwords are not the same!',
        },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
});

//------------------Middleware mã hóa password trước khi lưu vaò database
userSchema.pre('save', async function (next) {
    //Only run this function if password was actually modified
    if (!this.isModified('password')) return next();

    //12 - salt value, hashing cost //bigger the value strong the encryption be
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined; //donot store confirm password in Db

    next();
});

//------------------Nếu password bị sửa đổi thì phải cập nhật passwordChangedAt trước khi lưu vaò database
userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    //đôi khi xảy ra trường hợp token
    //được tạo trước mốc thời gian mật khẩu đã thay đổi
    //--Vậy nên cần trừ đi 1 giây để đảm bảo rằng token luôn được tạo sau khi mật khẩu đã được thay đổi.
    //to avoid race condition between updating db and json token creation
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

//---Return true or false
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

//-------JWTTimestamp: thời gian token được phát hành ("iat")
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        // console.log(changedTimestamp, JWTTimestamp);

        return JWTTimestamp < changedTimestamp;
    }

    // False means NOT changed
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // console.log({ resetToken }, this.passwordResetToken);

    // I need to specify a time to expire this token. In this example is (10 min)
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
