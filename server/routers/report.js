const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const { Vision } = require('../models/Vision');
const { Voice } = require('../models/Voice');
const { Word } = require('../models/Word');
const { Speechtext } = require('../models/Speechtext');

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
    User.findOneAndUpdate({ userFrom: req.body.userFrom }, {$set: {flower: req.body.flower}}, (err, user) => {
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
    Vision.findOne({ userFrom: req.query.userFrom, timestamp: req.query.timestamp }, (err, vision) => {
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

router.get('/voice', (req, res) => {
    let {PythonShell} = require('python-shell');
    let options = {
        mode: 'text',
        pythonPath: '',
        pythonOptions: ['-u'],
        scriptPath: '',
        args: null
    };
    
    PythonShell.run(__dirname+'/audio_analysis/audio_analysis.py', options, (err, result) => {
        if(err) throw err;
        console.log('result: ${result}');
        console.log('audio analysis finished');
    });

    Voice.findOne({ userFrom: req.query.userFrom, timestamp: req.query.timestamp }, (err, voice) => {
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
    Word.findOne({ userFrom: req.query.userFrom, timestamp: req.query.timestamp }, (err, word) => {
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
