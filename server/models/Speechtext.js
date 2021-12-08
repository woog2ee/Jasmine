const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const speechtextSchema = mongoose.Schema(
    {
        userFrom: {
            type: Schema.Types.ObjectID,
            ref: 'User',
        },
        createdAt: {
            type: String,
        },
        text: {
            type: Array,
        },
    },
    { timestamps: true }
);

const Speechtext = mongoose.model('Speechtext', speechtextSchema);
module.exports = { Speechtext };
