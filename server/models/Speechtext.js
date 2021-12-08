const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const speechtextSchema = mongoose.Schema({
    userFrom: {
        type: Schema.Types.ObjectID,
        ref: 'User',
    },
    createdAt: {
        type: String,
    },
    text: {
        type: String,
    },
});

const Speechtext = mongoose.model('Speechtext', speechtextSchema);
module.exports = { Speechtext };
