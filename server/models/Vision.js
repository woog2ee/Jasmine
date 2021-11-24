const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const visionSchema = mongoose.Schema(
    {
        userFrom: {
            type: Schema.Types.ObjectID,
            ref: 'User',
        },
        score: {
            type: Number,
            default: 0,
        },
        comment: {
            type: String,
        },
    },
    { timestamps: true }
);

const Vision = mongoose.model('Vision', visionSchema);
module.exports = { Vision };
