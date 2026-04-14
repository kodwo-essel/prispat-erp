import mongoose from "mongoose";

const CustomerFeedbackSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: false,
        },
        customerName: {
            type: String,
            required: true,
        },
        customerPhone: {
            type: String,
            required: false,
        },
        type: {
            type: String,
            enum: ["Compliment", "Complaint", "Suggestion", "Query"],
            required: true,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
        },
        comment: {
            type: String,
            required: true,
        },
        recordedBy: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.CustomerFeedback || mongoose.model("CustomerFeedback", CustomerFeedbackSchema);
