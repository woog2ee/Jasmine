const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const voiceSchema = mongoose.Schema({
    userFrom: {
        type: Schema.Types.ObjectID,
        ref: 'User',
    },
    createdAt: {
        type: String,
    },
    score: {
        type: Number,
    },
    slient_comment: {
        type: String,
    },
    speaktime_image: {
        type: String,
    },
    quiettime_image: {
        type: String,
    },
    tempo_comment: {
        type: String,
    },
    tempo_image: {
        type: String,
    },
    volume_comment: {
        type: String,
    },
    volume_image: {
        type: String,
    },
    slient_comment_c: {
        type: String,
    },
    tempo_comment_c: {
        type: String,
    },
    volume_comment_c: {
        type: String,
    },
});

const Voice = mongoose.model('Voice', voiceSchema);
module.exports = { Voice };
