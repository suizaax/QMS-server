import mongoose from "mongoose";

const { model, Schema } = mongoose


const counterSchema = new Schema({
    companyId: {
        type: String,
        required: true
    },
    serviceId: {
        type: String,
        required: true
    },
    counterId: {
        type: String,
        required: true
    },
    counterNumber: {
        type: Number,
        required: true,
        maxlength: 2
    },
}, { timestamps: true })

export default model("counter", counterSchema);