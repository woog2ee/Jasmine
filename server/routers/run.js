const express = require('express');
const router = express.Router();
const { Vision } = require('../models/Vision');
const { Voice } = require('../models/Voice');

router.post('/vision', (req, res) => {
    const vision = new Vision(req.body);

    vision.save((err, visionInfo) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
            success: true,
        });
    });
});

router.post('/voice', (req, res) => {
    const voice = new Voice(req.body);

    voice.save((err, voiceInfo) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
            success: true,
        });
    });
});

module.exports = router;
