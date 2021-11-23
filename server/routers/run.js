const express = require('express');
const router = express.Router();
const { Vision } = require('../models/Vision');
const { Audio } = require('../models/Audio');
const { Speechtext } = require('../models/Speechtext');

router.post('/vision', (req, res) => {
    const vision = new Vision(req.body);

    vision.save((err, visionInfo) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
            success: true,
        });
    });
});

router.post('/audio', (req, res) => {
    const audio = new Audio(req.body);

    audio.save((err, voiceInfo) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
            success: true,
        });
    });
});

router.post('/speechtext', (req, res) => {
    const speechtext = new Speechtext(req.body);

    speechtext.save((err, speechtextInfo) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
            success: true,
        });
    });
});

module.exports = router;
