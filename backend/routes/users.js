const express = require('express');
const router = express.Router();
const { getPool } = require('../db');

router.get('/', async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request().query(`
            SELECT id, full_name, phone, email, role, created_at 
            FROM users 
            ORDER BY id
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения пользователей' });
    }
});

module.exports = router;