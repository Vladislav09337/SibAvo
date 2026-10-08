const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

const server = process.env.DB_SERVER || 'localhost\\SQLEXPRESS';
const database = process.env.DB_DATABASE || 'SibAvto';

const config = {
    connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${server};Database=${database};Trusted_Connection=yes;TrustServerCertificate=yes;Encrypt=no;`
};

let pool;

async function connectDB() {
    try {
        console.log('Connecting to:', server, '/', database);
        pool = await sql.connect(config);
        console.log('Connected to SQL Server successfully');
        return pool;
    } catch (err) {
        console.error('DB connection error:');
        console.error('Message:', err.message);
        console.error('Code:', err.code);
        console.error('Original:', err.originalError);
        throw err;
    }
}

function getPool() {
    if (!pool) {
        throw new Error('Database not connected');
    }
    return pool;
}

module.exports = { connectDB, getPool, sql };