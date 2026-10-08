const express = require('express');
const router = express.Router();
const { getPool } = require('../db');

router.get('/', async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request().query(`
            SELECT 
                o.id, o.status, o.total_amount,
                o.delivery_method, o.payment_method,
                o.created_at,
                u.full_name AS user_name, u.phone AS user_phone
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения заказов' });
    }
});

module.exports = router;