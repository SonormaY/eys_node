const express = require('express');
const app = express();
const cors = require('cors');
const authRoutes = require('./routes/auth');
const fs = require('fs');
const https = require('https');
const port = process.env.PORT || 3001;

// load the certificate and key
const privateKey = fs.readFileSync('./certs/key.pem', 'utf8');
const certificate = fs.readFileSync('./certs/cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// create an https server
const httpsServer = https.createServer(credentials, app);

function ensureSecure(req, res, next) {
  if (req.secure) {
      // Request is already secure (HTTPS)
      return next();
  }
  // Redirect to HTTPS version of the URL
  res.redirect('https://' + req.hostname + req.originalUrl);
}

app.use(ensureSecure);

httpsServer.listen(443, () => {
  console.log(`Server is running on port ${443}`)
})






// console.clear();
// app.use(express.json());
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });
// app.use('/auth', authRoutes);
// app.use(cors({
//   origin: 'https://rpi4.uno',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
// }));


// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`)
// })