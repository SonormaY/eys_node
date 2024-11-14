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
        
        const extension = file.originalname.split('.').pop() + '-';
        let filename = file.originalname.split('.').slice(0, -1).join('.') + '.eys';
        let originalFilename = file.originalname.split('.').slice(0, -1).join('.') + '.eys';
        // add prefix with original file extension
        const encryptedData = Buffer.concat([Buffer.from(extension), Buffer.from('encryptedbyeys'), cipher.update(file.buffer), cipher.final()]);
        //save encrypted data to file
        const prefixes = ['encrypted-', 'decrypted-', 'encrypted', 'decrypted'];
        prefixes.forEach(prefix => {
            if (filename.startsWith(prefix)) {
            filename = filename.replace(prefix, '');
            }
            if (originalFilename.startsWith(prefix)) {
                filename = originalFilename.replace(prefix, '');
            }
        });
        filename = `encrypted-${userId}-${Date.now()}-${filename}`;
        fs.writeFileSync(`./wwwroot/${filename}`, encryptedData);
        // write encrypted data to database
        const fileId = await client.query(
            'INSERT INTO files (user_id, filename, original_filename) VALUES ($1, $2, $3) RETURNING id',
            [userId, filename, originalFilename]
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
    console.log('Decrypting file');
    const userId = jwt.decode(req.body.token).id;
    const client = await pool.connect();
    const file = req.file;
    await new Promise(resolve => setTimeout(resolve, process.env.POTATO_LEVEL * 500));
    console.log('Potato level:', process.env.POTATO_LEVEL);
    console.log('Sleeping for', process.env.POTATO_LEVEL * 500, 'ms');
    // get original file extension
    const extension = file.buffer.slice(0, file.buffer.indexOf('-')).toString();
    file.buffer = file.buffer.slice(Buffer.from(extension + '-').length);
    //check if file is already decrypted
    if (!file.buffer.toString().startsWith('encryptedbyeys')) {
        return res.status(400).send('File is already decrypted');
    }

    try {
        const key = await client.query(
            'SELECT key FROM users WHERE id = $1',
            [userId]
        );

        const decipher = crypto.createDecipheriv(algorithm, key.rows[0].key, Buffer.from(process.env.IV, 'hex'));
        // restore original file extension
        console.log('Extension:', extension);
        let filename = file.originalname.split('.').slice(0, -1).join('.') + '.' + extension;
        let originalFilename = file.originalname.split('.').slice(0, -1).join('.') + '.' + extension;
        // erase the 'encryptedbyeys' prefix
        file.buffer = file.buffer.slice(Buffer.from('encryptedbyeys').length);
        const decryptedData = Buffer.concat([decipher.update(file.buffer), decipher.final()]);
        //save decrypted data to file
        const prefixes = ['encrypted-', 'decrypted-', 'encrypted', 'decrypted'];
        prefixes.forEach(prefix => {
            if (filename.startsWith(prefix)) {
            filename = filename.replace(prefix, '');
            }
            if (originalFilename.startsWith(prefix)) {
                originalFilename = originalFilename.replace(prefix, '');
            }   
        });
        filename = `decrypted-${userId}-${Date.now()}-${filename}`;
        fs.writeFileSync(`./wwwroot/${filename}`, decryptedData);
        // write decrypted data to database
        const fileId = await client.query(
            'INSERT INTO files (user_id, filename, original_filename) VALUES ($1, $2, $3) RETURNING id',
            [userId, filename, originalFilename]
        );
        // return id of the file
        res.send({ fileId: fileId.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while decrypting the file');
    } finally {
        client.release();
    }

});

router.get('/download', verifyToken, async (req, res) => {
    const fileId = req.query.id;
    const userId = jwt.decode(req.headers.authorization.split(' ')[1]).id;
    const client = await pool.connect();
    console.log('Downloading file with id:', fileId);

    try {
        const file = await client.query(
            'SELECT user_id, filename, original_filename FROM files WHERE id = $1',
            [fileId]
        );

        if (file.rows.length === 0) {
            return res.status(404).send('File not found');
        }
        if (file.rows[0].user_id !== userId) {
            return res.status(403).send('You do not have permission to download this file');
        }
        const originalFilename = file.rows[0].original_filename;
        const data = fs.readFileSync(`./wwwroot/${file.rows[0].filename}`);
        res.setHeader('Content-Disposition', `attachment; filename="${originalFilename}"`);
        res.send(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while downloading the file');
    } finally {
        client.release();
    }
});





module.exports = router;