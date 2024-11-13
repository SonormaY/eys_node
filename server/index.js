const express = require('express');
const app = express();
const cors = require('cors');
const authRoutes = require('./routes/auth');
const filesRoutes = require('./routes/files');
const port = process.env.PORT || 3001;

console.clear();
app.use(express.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use('/auth', authRoutes);
app.use('/files', filesRoutes);
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
