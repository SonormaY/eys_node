const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const router = express.Router();
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/jwtMiddleware');
const pool = require('../config/db.config');
const algorithm = 'aes-256-ctr';

const upload = multer();

router.post('/encrypt', upload.single('file'), verifyToken, async (req, res) => {
    console.log('Encrypting file');
    const userId = jwt.decode(req.body.token).id;
    const client = await pool.connect();
    const file = req.file;
    await new Promise(resolve => setTimeout(resolve, process.env.POTATO_LEVEL * 500));
    console.log('Potato level:', process.env.POTATO_LEVEL);
    console.log('Sleeping for', process.env.POTATO_LEVEL * 500, 'ms');
    //check if file is already encrypted
    if (file.buffer.toString().startsWith('encryptedbyeys')) {
        return res.status(400).send('File is already encrypted');
    }

    try {
        const key = await client.query(
            'SELECT key FROM users WHERE id = $1',
            [userId]
        );

        const cipher = crypto.createCipheriv(algorithm, key.rows[0].key, Buffer.from(process.env.IV, 'hex'));
        
        let filename = file.originalname;
        const encryptedData = Buffer.concat([Buffer.from('encryptedbyeys'), cipher.update(file.buffer), cipher.final()]);
        //save encrypted data to file
        const prefixes = ['encrypted-', 'decrypted-', 'encrypted', 'decrypted'];
        prefixes.forEach(prefix => {
            if (filename.startsWith(prefix)) {
            filename = filename.replace(prefix, '');
            }
        });
        filename = `encrypted-${userId}-${Date.now()}-${filename}`;
        fs.writeFileSync(`./wwwroot/${filename}`, encryptedData);
        // write encrypted data to database
        const fileId = await client.query(
            'INSERT INTO files (user_id, filename, original_filename) VALUES ($1, $2, $3) RETURNING id',
            [userId, filename, file.originalname]
        );
        // return id of the file
        res.send({ fileId: fileId.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while encrypting the file');
    } finally {
        client.release();
    }
});

router.post('/decrypt', upload.single('file'), verifyToken, async (req, res) => {
    const userId = jwt.decode(req.body.token).id;
    const client = await pool.connect();
    const file = req.file;

    try {
        const key = await client.query(
            'SELECT key FROM users WHERE id = $1',
            [userId]
        );

        console.log('Key:', key.rows[0].key);
        const decipher = crypto.createDecipheriv(algorithm, key.rows[0].key, Buffer.from(process.env.IV, 'hex'));
        
        let filename = file.originalname;
        // erase the 'encryptedbyeys' prefix
        file.buffer = file.buffer.slice(Buffer.from('encryptedbyeys').length);
        const decryptedData = Buffer.concat([decipher.update(file.buffer), decipher.final()]);
        //save decrypted data to file
        const prefixes = ['encrypted-', 'decrypted-', 'encrypted', 'decrypted'];
        prefixes.forEach(prefix => {
            if (filename.startsWith(prefix)) {
            filename = filename.replace(prefix, '');
            }
        });
        fs.writeFileSync(`./wwwroot/decrypted-${filename}`, decryptedData);
        res.send({ decryptedData: 'decryptedData' });
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while decrypting the file');
    } finally {
        client.release();
    }

});

module.exports = router;