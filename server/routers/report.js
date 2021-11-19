const express = require('express');
const router = express.Router();
const { Vision } = require('../models/Vision');
const { Voice } = require('../models/Voice');
const { Word } = require('../models/Word');

router.post('/vision', (req, res) => {
    Vision.findOne({ userFrom: req.body.userFrom, timestamp: req.body.timestamp }, (err, vision) => {
        if (!vision) {
            return res.json({
                success: false,
                message: '해당 발표의 태도 분석 기록이 없습니다.',
            });
        } else {
            return res.status(200).json({ visionSuccess: true });
        }
    });
});

router.post('/voice', (req, res) => {
    Voice.findOne({ userFrom: req.body.userFrom, timestamp: req.body.timestamp }, (err, voice) => {
        if (!voice) {
            return res.json({
                success: false,
                message: '해당 발표의 목소리 분석 기록이 없습니다.',
            });
        } else {
            return res.status(200).json({ voiceSuccess: true });
        }
    });
});

router.post('/word', (req, res) => {
    Word.findOne({ userFrom: req.body.userFrom, timestamp: req.body.timestamp }, (err, word) => {
        if (!word) {
            return res.json({
                success: false,
                message: '해당 발표의 내용 분석 기록이 없습니다.',
            });
        } else {
            return res.status(200).json({ wordSuccess: true });
        }
    });
});

module.exports = router;
