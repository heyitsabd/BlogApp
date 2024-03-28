const {createHmac,randomBytes} = require('crypto')
const { Schema, model } = require("mongoose");
const { createTokenForUser } = require('../services/auth');
const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    salt: {
        type: String,
    },
    password: {
        type: String,
        require: true,
    },
    profileImageUrl: {
        type: String,
        default: "/images/default.png",
    },
    role: {
        type: String,
        enum: ["User", "Admin"],
        default: "User",
    },
});

/*
In Mongoose, a popular Object Data Modeling (ODM) 
library for MongoDB in Node.js, the pre() method is used 
to define middleware functions that execute before specific 
operations are performed on documents (instances of a Mongoose model). 
These middleware functions can intercept and modify data before it's 
saved to the database or processed in other ways.
*/

userSchema.pre('save',function(next){
    const user = this;
    if(!user.isModified('password')) return;

    const algorithm = 'sha256';
    const salt =randomBytes(16).toString();
    const hashedPassword= createHmac(algorithm,salt)
                .update(user.password)
                .digest('hex');
    this.salt=salt;
    this.password=hashedPassword;
    next()
})

userSchema.static('matchPasswordAndGenerateToken',async function (email,password){
    const user = await this.findOne({email});
    if(!user) throw new Error('User not found');

    const algorithm = 'sha256';
    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac(algorithm,salt)
    .update(password)
    .digest('hex');

    if(userProvidedHash!==hashedPassword) throw new Error('Incorrect Password')

    const token = createTokenForUser(user);
    return token;
})

const User = model("user", userSchema);

module.exports = User;
