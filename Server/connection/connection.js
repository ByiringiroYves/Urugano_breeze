const { MONGO_URI } = require('./config');

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected to Atlas'))
    .catch(err => console.error('Error connecting to MongoDB:', err));
