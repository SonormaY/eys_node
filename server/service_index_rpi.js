const express = require('express');
const app = express();
const cors = require('cors');
const serviceRoutes = require('./routes/service');
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
app.use('/', serviceRoutes);
app.use(cors({
  origin: 'https://rpi4.uno',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));

httpsServer.listen(8443, () => {
  console.log(`Server is running on port ${8443}`)
})
