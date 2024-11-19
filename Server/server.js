const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { MONGO_URI } = require('./connection/config');
const routes = require('./routes'); // Import main routes file

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected to Atlas Cloud'))
    .catch(err => console.error('Error connecting to MongoDB:', err));


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
