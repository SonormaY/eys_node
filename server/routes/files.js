const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const { Worker } = require('worker_threads');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/jwtMiddleware');
const pool = require('../config/db.config');
const algorithm = 'aes-256-ctr';
const upload = multer();


function runWorker(workerData) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.resolve(__dirname, '../middleware/encryptionWorker.js'), { workerData });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
}

router.post('/encrypt', upload.single('file'), verifyToken, async (req, res) => {
    const userId = jwt.decode(req.body.token).id;
    const client = await pool.connect();
    const file = req.file;
    console.log(`[${new Date().toISOString()}] I'm ${process.env.WORKER_TYPE || ''} worker ${process.env.WORKER_ID || ''} | Starting encryption of ${file.originalname} for user ${userId}`);
    await new Promise(resolve => setTimeout(resolve, process.env.POTATO_LEVEL * 500));
    //check if file is already encrypted
    if (file.buffer.toString().startsWith('encryptedbyeys')) {
        return res.status(400).send('File is already encrypted');
    }

    try {
        const key = await client.query(
            'SELECT key FROM users WHERE id = $1',
            [userId]
        );
        
        const extension = file.originalname.split('.').pop() + '.';
        let filename = file.originalname.split('.').slice(0, -1).join('.') + '.eys';
        let originalFilename = file.originalname.split('.').slice(0, -1).join('.') + '.eys';

        const encryptedData = await runWorker({
            fileBuffer: file.buffer,
            extension: extension,
            key: key.rows[0].key,
            algorithm: algorithm,
            action: 'encrypt'
        });
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
        fs.promises.writeFile(`./wwwroot/${filename}`, encryptedData);
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
        console.log(`[${new Date().toISOString()}] I'm ${process.env.WORKER_TYPE || ''} worker ${process.env.WORKER_ID || ''} | Finished encryption of ${file.originalname} for user ${userId}`);
    }
});

router.post('/decrypt', upload.single('file'), verifyToken, async (req, res) => {
    const userId = jwt.decode(req.body.token).id;
    const client = await pool.connect();
    const file = req.file;
    console.log(`[${new Date().toISOString()}] I'm ${process.env.WORKER_TYPE || ''} worker ${process.env.WORKER_ID || ''} | Starting decryption of ${file.originalname} for user ${userId}`);
    await new Promise(resolve => setTimeout(resolve, process.env.POTATO_LEVEL * 500));
    // get original file extension
    const extension = file.buffer.slice(0, file.buffer.indexOf('.')).toString();
    file.buffer = file.buffer.slice(Buffer.from(extension + '.').length);
    //check if file is already decrypted
    if (!file.buffer.toString().startsWith('encryptedbyeys')) {
        return res.status(400).send('File is already decrypted');
    }

    try {
        const key = await client.query(
            'SELECT key FROM users WHERE id = $1',
            [userId]
        );

        // restore original file extension
        let filename = file.originalname.split('.').slice(0, -1).join('.') + '.' + extension;
        let originalFilename = file.originalname.split('.').slice(0, -1).join('.') + '.' + extension;
        // erase the 'encryptedbyeys' prefix
        const decryptedData = await runWorker({
            fileBuffer: file.buffer,
            extension: extension,
            key: key.rows[0].key,
            algorithm: algorithm,
            action: 'decrypt'
        });
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
        fs.promises.writeFile(`./wwwroot/${filename}`, decryptedData);
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
        console.log(`[${new Date().toISOString()}] I'm ${process.env.WORKER_TYPE || ''} worker ${process.env.WORKER_ID || ''} | Finished decryption of ${file.originalname} for user ${userId}`);
    }

});

module.exports = router;
