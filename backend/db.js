const sql = require('mssql');
require('dotenv').config();

const config = {
    server: process.env.DB_SERVER || 'host.docker.internal',
    database: process.env.DB_DATABASE || 'SibAvto',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

let pool;

async function connectDB() {
    try {
        console.log('Connecting to:', config.server, '/', config.database);
        pool = await sql.connect(config);
        console.log('Connected to SQL Server successfully');
        return pool;
    } catch (err) {
        console.error('DB connection error:', err.message);
        // НЕ падаем — сервер продолжит работу
        return null;
    }
}

function getPool() {
    if (!pool) {
        throw new Error('Database not connected');
    }
    return pool;
}

module.exports = { connectDB, getPool, sql };