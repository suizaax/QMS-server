import mongoose from "mongoose";

const { Schema, model } = mongoose;

const TicketSchema = new Schema({
    companyId: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    serviceName: {
        type: String,
        required: false
    },
    phoneNumber: {
        type: String,
        required: false
    },
    qrCode: {
        type: String,
        required: false
    },
    websiteLink: {
        type: String,
        required: false
    },
    thankingMessage:{
        type: String,
        required: false
    }
}, { timestamps: true })

export default model("ticket", TicketSchema)