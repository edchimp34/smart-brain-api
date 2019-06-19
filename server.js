const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex')

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

app.post('/signin', (req, res) => {
    db.select('email', 'hash').from('login')
        .where('email', '=', req.body.email)
        .then(data => {
            const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
            if (isValid) {
                return db.select('*').from('users')
                .where('email', '=', req.body.email)
                .then(user => {
                    res.json(user[0]);
                })
                .catch(err => res.status(400).json('Unable to get user'));
            } else {
                res.status(400).json('Credentials were incorrect');
            }
        })
        .catch(err => res.status(400).json('Wrong credentials'));
});

app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
            .returning('*')
            .insert({
                email: loginEmail[0],
                name: name,
                joined: new Date()
            })
            .then(user => {
                res.json(user[0]);
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('unable to register user'));
});

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;

    db.select('*').from('users').where('id', id)
      .then(users => {
          if (users.length) {
            res.json(users[0]);
          } else {
            res.status(404).send('not found');
          }
      })
      .catch(err => {
        res.status(400).json('error getting user');
      });
});

app.put('/image', (req, res) => {
    const { id } = req.body;

    db('users').where({id}).increment({entries: 1}).returning('entries')
      .then(entries => {
          if (entries.length) {
            res.json(entries[0]);
          } else {
            res.status(400).json('no entries found');
          }
      })
      .catch(err => res.status(400).json('error updating entries'));
});

app.listen(3000, () => {
    console.log('app is running on port 3000');
});