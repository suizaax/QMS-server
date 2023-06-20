import mongoose from "mongoose";

const { model, Schema } = mongoose


const historyScheme = new Schema({
    agentId: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    ticketID: {
        type: String,
        required: true
    },
    serviceName: {
        type: String,
        required: true
    },
    ticketNumber: {
        type: String,
        required: true
    }
}, { timestamps: true })

export default model("History", historyScheme)