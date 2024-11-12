// auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db.config');

router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const username = req.body.username.toLowerCase();
    
    const client = await pool.connect();
    
    try {
        // Start transaction
        await client.query('BEGIN');
        
        // Check if email already exists
        const emailCheck = await client.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        
        if (emailCheck.rows.length > 0) {
            return res.send({ error: 'Email already exists' });
        }
        
        // Check if username already exists
        const usernameCheck = await client.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );
        
        if (usernameCheck.rows.length > 0) {
            return res.send({ error: 'Username already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert new user
        const insertQuery = `
            INSERT INTO users (email, username, passwd_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, email, username, role
        `;
        
        const result = await client.query(insertQuery, [
            email,
            username,
            hashedPassword,
            'user'
        ]);
        
        // Commit transaction
        await client.query('COMMIT');
        
        console.log('User registered');
        res.send({
            message: 'User registered',
            user: {
                id: result.rows[0].id,
                email: result.rows[0].email,
                username: result.rows[0].username,
                role: result.rows[0].role
            }
        });
        
    } catch (err) {
        // Rollback in case of error
        await client.query('ROLLBACK');
        console.error('Error during registration:', err);
        res.status(500).send({ error: 'Internal server error during registration' });
    } finally {
        client.release();
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    const client = await pool.connect();
    
    try {
        const query = `
            SELECT id, email, username, passwd_hash as "passwdHash", role
            FROM users 
            WHERE email = $1
        `;
        
        const result = await client.query(query, [email]);
        
        if (result.rows.length > 0) {
            const match = await bcrypt.compare(password, result.rows[0].passwdHash);
            
            if (match) {
                const token = jwt.sign(
                    {
                        id: result.rows[0].id,
                        email: result.rows[0].email,
                        role: result.rows[0].role
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: '2h' }
                );
                
                res.json({ token });
                console.info('User logged in');
            } else {
                res.send({ error: 'Wrong email/password combination' });
            }
        } else {
            res.send({ error: 'Wrong email/password combination' });
        }
        
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send({ error: 'Internal server error during login' });
    } finally {
        client.release();
    }
});

module.exports = router;
