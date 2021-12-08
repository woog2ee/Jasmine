const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const { Vision } = require('../models/Vision');
const { Voice } = require('../models/Voice');
const { Word } = require('../models/Word');

router.get('/list', (req, res) => {
    Vision.find({ userFrom: req.query.userFrom }, (err, list) => {
        if (err) {
            return res.status(400).send(err);
        } else {
            return res.status(200).json({
                success: true,
                list: list,
            });
        }
    });
});

router.get('/user', (req, res) => {
    User.findOne({ _id: req.query.userFrom }, (err, user) => {
        if (err) {
            return res.status(400).send(err);
        } else {
            return res.status(200).json({
                success: true,
                user: user,
            });
        }
    });
});

router.put('/flower', (req, res) => {
    User.findOneAndUpdate({ _id: req.body.userFrom }, {$inc: {flower: req.body.flower}}, {new: true}, (err, user) => {
        if (err) {
            return res.status(400).send(err);
        } else {
            return res.status(200).json({
                success: true,
                user: user,
            });
        }
    });
});

router.get('/vision', (req, res) => {
    Vision.findOne({ userFrom: req.query.userFrom, createdAt: req.query.timestamp }, (err, vision) => {
        if (err) {
            return res.status(400).send(err);
        } else {
            return res.status(200).json({
                success: true,
                list: vision,
            });
        }
    });
});

router.post('/voiceandword', (req, res) => {
    const spawn = require('child_process').spawn;

    var process_voice = spawn('python', [__dirname+'/audio_analysis/audio_analysis.py']);
    process_voice.stdout.on('data', function(data) {
        console.log(data.toString());
    });
    process_voice.stderr.on('data', function(data){
        console.error(data.toString());
    });

    var process_text = spawn('python', [__dirname+'/text_analysis/text_analysis.py']);
    process_text.stdout.on('data', function(data) {
        console.log(data.toString());
    });
    process_text.stderr.on('data', function(data){
        console.error(data.toString());
    });
})

router.get('/voice', (req, res) => {
    Voice.findOne({ userFrom: req.query.userFrom, createdAt: req.query.timestamp }, (err, voice) => {
        if (err) {
            return res.status(400).send(err);
        } else {
            return res.status(200).json({
                success: true,
                list: voice,
            });
        }
    });
});

router.get('/word', (req, res) => {
    Word.findOne({ userFrom: req.query.userFrom, createdAt: req.query.timestamp }, (err, word) => {
        if (err) {
            return res.status(400).send(err);
        } else {
            return res.status(200).json({
                success: true,
                list: word,
            });
        }
    });
});

module.exports = router;
