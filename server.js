const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const db = knex({
    client: 'pg',
    connection: {
        host : '127.0.0.1',
        user : 'postgres',
        password : 'test',
        database : 'smart-brain'
    }
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    db('users').select('*')
    .then(users => {
        res.send(users);
    })
    .catch(err => res.status(400).json('Getting users failed'));
});

app.post('/signin', signin.handleSignin(db, bcrypt));

app.post('/register', register.handleRegister(db, bcrypt));

app.get('/profile/:id', profile.handleProfileGet(db));

app.put('/image', image.handleImage(db));

app.post('/imageurl', image.handleApiCall());

// app.post('/signin', (req, res) => {
//     signin.handleSignin(req, res, db, bcrypt);
// });

// app.post('/register', (req, res) => {
//     register.handleRegister(req, res, db, bcrypt);
// });

// app.get('/profile/:id', (req, res) => {
//     profile.handleProfileGet(req, res, db);
// });

// app.put('/image', (req, res) => {
//     image.handleImage(req, res, db);
// });

// const PORT = process.env.PORT;
// app.listen(PORT, () => {
//     console.log(`app is running on port ${PORT}`);
// });

app.listen(3000, () => {
    console.log(`app is running on port 3000`);
});