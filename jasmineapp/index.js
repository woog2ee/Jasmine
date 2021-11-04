const express = require('express')
const app = express()
const port = 5000
// const bodyParser = require('body-parser')
const { User } = require('./models/User')


// app.use(bodyParser.urlencoded({extended: true}));
// app.use(bodyParser.json);
app.use(express.urlencoded({extended: true}));
app.use(express.json());


const mongoose = require('mongoose');
const { useReducer } = require('react');
mongoose.connect('mongodb+srv://sangh:0000@jasmine.iqad5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
	useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))

app.get('/', (req, res) => {
	res.send('Hello World~!')
})

app.post('/register', (req, res) => {

	// 회원 가입할 때 필요한 정보들을 client에서 가져오면
	// 그것들을 데이터베이스에 넣어준다.

	const user = new User(req.body)

	user.save((err, userInfo) => {
		if (err) return res.json({success: false, err})
		return res.status(200).json({
			success: true
		})
	})

})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})
