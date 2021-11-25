const express = require('express');
const app = express();
const port = 4000;
const cookieParser = require('cookie-parser');
const config = require('./config/key');

app.use(express.urlencoded({ extended: true, limit: '30mb' }));
app.use(express.json({ limit: '30mb' }));
app.use(cookieParser());

const mongoose = require('mongoose');
mongoose
    .connect(config.mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB Connected...'))
    .catch((err) => console.log(err));

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

app.use('/api/users', require('./routers/user'));
app.use('/api/run', require('./routers/run'));
app.use('/api/report', require('./routers/report'));