import mongoose from "mongoose";

const { Schema } = mongoose;

const clientSchema = new Schema({
    number: {
        type: Number,
        required: true,
    },
    letter: {
        type: String,
        required: true
    },
    agentName: {
        type: String,
        required: true
    },
    // agentId: {
    //     type: String,
    //     required: true
    // },
    companyId: {
        type: String,
        required: true
    },
    service: {
        type: String,
        required: true
    },
    issuedTime: {
        type: Date,
        default: Date.now(),
        index: true
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
    },
    phoneNumber: {
        type: String,
        required: false
    },
    clientType: {
        type: String,
        required: true
    }
}, { timestamps: true })

export default mongoose.model('clients', clientSchema)