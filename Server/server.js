const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const routes = require('./routes'); // Import main routes file

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect('mongodb://urugano:2090@localhost:27017/urugano_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: "urugano_db"
  }).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


// Middleware  
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

//routes
app.use('/api', routes); // Any other routes

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Something went wrong!' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
