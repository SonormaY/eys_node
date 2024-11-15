const cluster = require('node:cluster');
const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const https = require('https');
const verifyToken = require('./middleware/jwtMiddleware');
require('dotenv').config();

const MAX_WORKERS = require('os').availableParallelism() - 1; 
let workerTasks = new Map();
console.log('Max cluster workers:', MAX_WORKERS);
console.log('Starting server in cluster mode');

// generate free ids to be used by new workers except first worker
let freeIDs = Array.from({ length: MAX_WORKERS - 1 }, (_, i) => i + 2);
console.log('Free worker IDs:', freeIDs);
let currentWorkerCount = 0;
cluster.setupPrimary({
exec: './files_index_rpi.js',
});
const primaryWorker = cluster.fork({
    WORKER_ID: ++currentWorkerCount
});
workerTasks.set(primaryWorker.id, 0);
const forkWorker = () => {
    const worker = cluster.fork({ 
        WORKER_ID: freeIDs.shift()
    });
    workerTasks.set(worker.id, 0);
}

cluster.on('message', async (worker, message) => {
    if (message.type === 'task_start') {
        const currentTasks = workerTasks.get(worker.id) + 1;
        workerTasks.set(worker.id, currentTasks);
        const maxTasks = parseInt(process.env.MAX_TASKS, 10);
        if (currentTasks >= maxTasks - 1 && freeIDs.length > 0) {
            console.log(`Worker ${worker.id} is busy, forking new worker`);
            forkWorker();
        }
    } else if (message.type === 'task_complete') {
        const currentTasks = workerTasks.get(worker.id);
        workerTasks.set(worker.id, currentTasks - 1);
        if ((currentTasks - 1 === 0) && worker.id !== 1) {
            console.log(`Worker ${worker.id} is idle, killing worker`);
            await worker.kill();
            freeIDs.push(worker.id);
            freeIDs.sort();
        }
    }
});
cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.id} died with code ${code} and signal ${signal}`);
    workerTasks.delete(worker.id);
    freeIDs.push(worker.id);
    freeIDs.sort();
    const newWorker = cluster.fork({ 
        WORKER_ID: freeIDs.shift()
        });
    workerTasks.set(newWorker.id, 0);
    });

const privateKey = fs.readFileSync('./certs/key.pem', 'utf8');
const certificate = fs.readFileSync('./certs/cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);

function ensureSecure(req, res, next) {
  if (req.secure) {
      return next();
  }
  res.redirect('https://' + req.hostname + req.originalUrl);
}

app.use(ensureSecure);
app.use(express.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.get('/workers', verifyToken, async (req, res) => {
    if (jwt.decode(req.headers.authorization.split(' ')[1]).role !== 'admin') {
        return res.status(403).send('Forbidden');
    }
    const workers = [];
    workerTasks.forEach((tasks, id) => {
        if (tasks > 0 || id === 1) {
            workers.push({
                id: id,
                tasks: tasks
            });
        }  
    });
    res.json({
        workers: workers,
        totalWorkers: workers.length,
        maxWorkers: MAX_WORKERS,
        maxTasks: process.env.MAX_TASKS
    });
});

app.use(cors({
    origin: 'https://rpi4.uno',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));
  
httpsServer.listen(8441, () => {
console.log(`Server is running on port ${8441}`)
})