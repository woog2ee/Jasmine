const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wordSchema = mongoose.Schema(
    {
        userFrom: {
            type: Schema.Types.ObjectID,
            ref: 'User',
        },
        createdAt: {
            type: String,
        },
        score: {
            type: Number,
            default: 0,
        },
        variety_cmt: {
            type: String,
        },
        sentcount_cmt: {
            type: String,
        },
        sentcount_img: {
            type: String,
        },
        keywords_cmt: {
            type: String,
        },
        keywords_img: {
            type: String,
        },
        top3_keywords: {
            type: String,
        },
        stopwords_cmt: {
            type: String,
        },
        stopwords_img: {
            type: String,
        },
        top3_stopwords: {
            type: String,
        },
        countwords_cmt: {
            type: String,
        },
        countwords_img: {
            type: String,
        },
        top3_countwords: {
            type: String,
        },
        keywords_cmt_c: {
            type: String,
        },
        stopwords_cmt_c: {
            type: String,
        },
        countwords_cmt_c: {
            type: String,
        },
    },
    { timestamps: true }
);

const Word = mongoose.model('Words', wordSchema);
module.exports = { Word };
