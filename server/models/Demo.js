const mongoose = require('mongoose');

const demoSchema = mongoose.Schema({
    imageData: { type: Buffer },
    imageType: { type: String },
    imageName: { type: String },
});

const Demo = mongoose.model('Demo', demoSchema);
module.exports = { Demo };
