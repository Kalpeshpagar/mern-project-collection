import mongoose from "mongoose";

const transactionSchema = mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
    },
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    issuedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    returnedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    issueDate: { type: Date, required: true },   
    dueDate:   { type: Date, required: true },  
    returnDate:{ type: Date, default: null },     // ← null = still active borrow

    status: {
        type: String,
        enum: ['issued', 'returned', 'overdue', 'renewed', 'lost'], 
        required: true,
        default: 'issued',
    },
    renewCount: { type: Number, default: 0 },
    fine:  { type: mongoose.Schema.Types.ObjectId, ref: 'Fine' },
    notes: { type: String },

}, { timestamps: true });

export const Transaction = mongoose.model("Transaction", transactionSchema);