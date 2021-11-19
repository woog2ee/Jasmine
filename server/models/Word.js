const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wordSchema = mongoose.Schema(
    {
        userFrom: {
            type: Schema.Types.ObjectID,
            ref: 'User',
        },
        variety_comment: {
            type: String,
        },
        sentcount_comment: {
            type: String,
        },
        sentcount_image: {
            type: String,
        },
        keywords_comment: {
            type: String,
        },
        keywords_image: {
            type: String,
        },
        stopwords_comment: {
            type: String,
        },
        stopwords_image: {
            type: String,
        },
        countwords_comment: {
            type: String,
        },
        countwords_image: {
            type: String,
        },
    },
    { timestamps: true }
);

const Word = mongoose.model('Words', wordSchema);
module.exports = { Word };
