import mongoose from "mongoose";

const { Schema } = mongoose;

const serviceSchema = new Schema({
    serviceId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    letter: {
        type: String,
        required: true,
        maxlength: 2
    },
    agentId: {
        type: Array,
        required: false
    },
    icon: {
        type: String,
        required: true
    },
    companyId: {
        type: String,
        required: true
    },
}, { timestamps: true })

export default mongoose.model("service", serviceSchema);