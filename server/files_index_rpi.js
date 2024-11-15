const express = require('express');
const app = express();
const cors = require('cors');
const filesRoutes = require('./routes/files');
const fs = require('fs');
const https = require('https');

// load the certificate and key
const privateKey = fs.readFileSync('./certs/key.pem', 'utf8');
const certificate = fs.readFileSync('./certs/cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// create an https server
const httpsServer = https.createServer(credentials, app);

function ensureSecure(req, res, next) {
  if (req.secure) {
      return next();
  }
  // Redirect to HTTPS version of the URL
  res.redirect('https://' + req.hostname + req.originalUrl);
}

app.use(ensureSecure);
app.use(express.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
// Middleware to notify main process when a task starts
app.use((req, res, next) => {
    if (process.send) {
      process.send({ type: 'task_start' });
    }
  
    res.on('finish', () => {
      if (process.send) {
        process.send({ type: 'task_complete' });
      }
    }
    );
  
  next();
});
app.use('/api/files', filesRoutes);
app.use(cors({
  origin: 'https://rpi4.uno',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));

httpsServer.listen(8442, () => {
  console.log(`Server is running on port ${8442}`)
})
