const express = require('express');
const app = express();
const cors = require('cors');
const serviceRoutes = require('./routes/service');
const filesRoutes = require('./routes/files');
const port = process.env.PORT || 3001;

console.log(`I'm ${process.env.WORKER_ID} worker `);
app.use(express.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  next();
});
// Middleware to notify main process when a task starts
app.use((req, res, next) => {
  if (req.url == '/files/encrypt' || req.url == '/files/decrypt'){
    if (process.send) {
      process.send({ type: 'task_start' });
    }
  
    res.on('finish', () => {
      if (process.send) {
        process.send({ type: 'task_complete' });
      }
    }
    );
  }
  
  next();
});
app.use('/files', filesRoutes);
app.use('/service', serviceRoutes);
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
