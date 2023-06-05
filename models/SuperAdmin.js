import mongoose from "mongoose";

const { Schema } = mongoose;

const superAdminSchema = new Schema({
    adminId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        required: false,
        default: null
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: true
    },
    lastLogin: {
        type: Date,
        default: Date.now()
    },
    accentColor: {
        type: String,
        default: "#4B2DCC"
    },
    SBtitleBGColor: {
        type: String,
        default: "#4B2DCC"
    },
    SBnews: {
        type: Array,
        required: false
    },
    SBTitle: {
        type: String,
        default: "Updates"
    }
}, { timestamps: true })

export default mongoose.model("SuperAdmin", superAdminSchema)