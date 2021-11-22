const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const audioSchema = mongoose.Schema(
    {
        userFrom: {
            type: Schema.Types.ObjectID,
            ref: 'User',
        },
        audioUrl: {
            type: String,
        },
    },
    { timestamps: true }
);

const Audio = mongoose.model('Audio', audioSchema);
module.exports = { Audio };
