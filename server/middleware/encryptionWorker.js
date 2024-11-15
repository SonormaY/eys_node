const { parentPort, workerData } = require('worker_threads');
const crypto = require('crypto');

const { fileBuffer, extension, key, algorithm, action } = workerData;

if (action === 'encrypt') {
    const cipher = crypto.createCipheriv(algorithm, key, Buffer.from(process.env.IV, 'hex'));
    const encryptedData = Buffer.concat([
        Buffer.from(extension),
        Buffer.from('encryptedbyeys'),
        cipher.update(fileBuffer),
        cipher.final()
    ]);
    parentPort.postMessage(encryptedData);
} else if (action === 'decrypt') {
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(process.env.IV, 'hex'));
    const decryptedData = Buffer.concat([
        decipher.update(fileBuffer.slice(Buffer.from('encryptedbyeys').length)),
        decipher.final()
    ]);
    parentPort.postMessage(decryptedData);
}
