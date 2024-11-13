const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const router = express.Router();
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/jwtMiddleware');
const pool = require('../config/db.config');
const algorithm = 'aes-256-ctr';

router.post('/encrypt', verifyToken, async (req, res) => {
    const userId = jwt.decode(req.body.token).id;
    const client = await pool.connect();

    try {
        const key = await client.query(
            'SELECT key FROM users WHERE id = $1',
            [userId]
        );

        console.log('Key:', key.rows[0].key);
        const cipher = crypto.createCipheriv(algorithm, key.rows[0].key, Buffer.from(process.env.IV, 'hex'));
        
        // save file to disk to test encryption
        console.log('File name:', req.body.fileName);
        fs.writeFileSync('../wwwroot/' + req.body.fileName, req.body.file, 'base64');
        

        //convert file to buffer without fs
        // const fileBuffer = Buffer.from(req.body.file, 'base64');
        // const encryptedData = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
        // res.send({ encryptedData: encryptedData.toString('hex') });
        res.send({ encryptedData: 'encryptedData' });
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while encrypting the file');
    } finally {
        client.release();
    }

});

router.post('/decrypt', verifyToken, async (req, res) => {
    const userId = jwt.decode(req.body.token).id;
    const client = await pool.connect();

    try {
        const key = await client.query(
            'SELECT key FROM users WHERE id = $1',
            [userId]
        );

        console.log('Key:', key.rows[0].key);
        const decipher = crypto.createDecipheriv(algorithm, key.rows[0].key, Buffer.from(process.env.IV, 'hex'));
        
        const encryptedData = Buffer.from(req.body.encryptedData, 'hex');
        const decryptedData = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
        res.send({ decryptedData: decryptedData.toString('hex   ') });
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while decrypting the file');
    } finally {
        client.release();
    }
});

module.exports = router;