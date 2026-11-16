const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // ОБЯЗАТЕЛЬНО для Supabase
});

async function connectDB() {
    try {
        const client = await pool.connect();
        console.log('✅ Connected to Supabase PostgreSQL');
        client.release();
        return pool;
    } catch (err) {
        console.error('❌ DB connection error:', err.message);
        return null;
    }
}

function getPool() {
    if (!pool) throw new Error('Database not connected');
    return pool;
}

module.exports = { connectDB, getPool };