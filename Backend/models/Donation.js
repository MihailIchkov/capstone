import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Donation = mongoose.model('Donation', donationSchema);

export default Donation;
