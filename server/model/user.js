const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        userName: { 
            type: String,
            required: true,
            unique: true
        },
        nickName: { 
            type: String,
            required: true,
        },
        phone: { 
            type: String,
            required: true,
            unique: true
        },
        email: { 
            type: String,
            required: true,
            unique: true
        },
        dateOfBirth: { 
            type: Date,
            required: true
        },
        gender: { 
            type: String,
            enum: ["male", "female", "other"]
        },
        isOnline: { 
            type: Boolean, 
            default: false,
            required: true 
        },
        lastActive: { 
            type: Date
        },
        profilePicture: { 
            type: String
        },
        bio: { 
            type: String
        },
        password: { 
            type: String,
            required: true
        },
        isCall: {
            type: String,
            enum: ["available", "calling", "onCall"],
            default: "available"
        },
    },
    { 
        timestamps: true, 
        versionKey: false 
    }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
