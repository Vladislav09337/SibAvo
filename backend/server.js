const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files from frontend folder
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API routes
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));

// API main page
app.get('/api', (req, res) => {
    res.json({
        message: 'SibAvto API is working!',
        endpoints: {
            products: '/api/products',
            orders: '/api/orders',
            users: '/api/users'
        }
    });
});

async function start() {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server started: http://localhost:${PORT}`);
            console.log(`Site: http://localhost:${PORT}/index.html`);
            console.log(`API: http://localhost:${PORT}/api`);
        });
    } catch (err) {
        console.error('Start error:', err);
        process.exit(1);
    }
}

start();