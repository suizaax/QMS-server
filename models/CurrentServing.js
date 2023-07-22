import mongoose from "mongoose";

const { Schema, model } = mongoose

const currentServingSchema = new Schema({
    currentCounter: {
        type: String,
        required: true,
    },
    clientType: {
        type: String,
        required: true
    },
    ticketNumber: {
        type: String,
        required: true
    },
    companyId: {
        type: String,
        required: true
    }
}, { timestamps: true })

export default model("currentServing", currentServingSchema);