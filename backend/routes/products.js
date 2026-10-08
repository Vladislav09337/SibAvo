const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../db');

router.get('/', async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request().query(`
            SELECT 
                p.id, p.article, p.name, p.description,
                p.price, p.quantity, p.status,
                c.name AS category, m.name AS manufacturer
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN manufacturers m ON p.manufacturer_id = m.id
            ORDER BY p.id
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения товаров' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM products WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка' });
    }
});

module.exports = router;