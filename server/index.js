const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./config/db.config');
const port = 3001;

console.clear();
app.use(express.json());
app.use(cors());


app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

app.post('/register', (req, res) => {
  const email = req.body.email
  const username = req.body.username.toLowerCase()
  const password = req.body.password

  // Check if email already exists
  const sqlCheckEmail = 'SELECT * FROM users WHERE email = ?';
  db.query(sqlCheckEmail, [email], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else if (result.length > 0) {
      res.send({error: 'Email already exists'});
    } else {
      // Check if username already exists
      const sqlCheckUsername = 'SELECT * FROM users WHERE username = ?';
      db.query(sqlCheckUsername, [username], (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).send(err);
        } else if (result.length > 0) {
          res.send({error: 'Username already exists'});
        } else {
          // hash password
          let hashedPassword = bcrypt.hashSync(password, 10);

          const sqlInsert = 'INSERT INTO users (email, username, passwdHash, role) VALUES (?,?,?,?)';
          const values = [email, username, hashedPassword, 'user'];

          db.query(sqlInsert, values, (err, result) => {
            if (err) {
              console.log(err);
              res.status(500).send(err);
            } else {
              console.log('User registered');
              res.send({message: 'User registered'});
            }
          })
        }
      })
    }
  })
})

app.post('/login', (req, res) => {
  const email = req.body.email
  const password = req.body.password

  const sqlSelect = 'SELECT * FROM users WHERE email = ?';
  const values = [email];
  
  db.query(sqlSelect, values, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    }
    else if (result.length > 0) {
        bcrypt.compare(password, result[0].passwdHash, (error, response) => {
          if (response) {
            //send user data without password
            const user = {
              id: result[0].id,
              email: result[0].email,
              username: result[0].username,
              role: result[0].role  
            }
            res.send({
              message: 'User logged in',
              user: user
            });
            console.clear();
            console.info('User logged in');
            console.log(user);
          } else {
            res.send({error: 'Wrong email/password combination'});
          }
        })
    } 
    else {
        res.send({error: 'Wrong email/password combination'});
    }
  })
})