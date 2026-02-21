const express = require("express");
const { query, validationResult } = require("express-validator");
const pool = require("../config/db");

const router = express.Router();

router.get("/summary", [query("startDate").optional().isISO8601(), query("endDate").optional().isISO8601()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { startDate, endDate } = req.query;
    let sql = "SELECT COALESCE(SUM(revenue), 0) AS total_revenue, COALESCE(SUM(quantity), 0) AS total_quantity, COUNT(*) AS total_sales FROM sales WHERE 1=1";
    const params = [];
    let idx = 1;
    if (startDate) {
      sql += ` AND sale_date >= $${idx}`;
      params.push(startDate);
      idx++;
    }
    if (endDate) {
      sql += ` AND sale_date <= $${idx}`;
      params.push(endDate);
      idx++;
    }
    const result = await pool.query(sql, params);
    const row = result.rows[0];
    res.json({
      success: true,
      data: {
        totalRevenue: parseFloat(row.total_revenue) || 0,
        totalQuantity: parseInt(row.total_quantity, 10) || 0,
        totalSales: parseInt(row.total_sales, 10) || 0,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
});

router.get("/filter", [query("startDate").optional().isISO8601(), query("endDate").optional().isISO8601(), query("product").optional().isString(), query("category").optional().isString(), query("region").optional().isString()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { startDate, endDate, product, category, region } = req.query;
    let sql = "SELECT sale_date, product_name, category, region, revenue, quantity, discount, rating, review_count FROM sales WHERE 1=1";
    const params = [];
    let idx = 1;
    if (startDate) {
      sql += ` AND sale_date >= $${idx}`;
      params.push(startDate);
      idx++;
    }
    if (endDate) {
      sql += ` AND sale_date <= $${idx}`;
      params.push(endDate);
      idx++;
    }
    if (product) {
      sql += ` AND product_name ILIKE $${idx}`;
      params.push(`%${product}%`);
      idx++;
    }
    if (category) {
      sql += ` AND category ILIKE $${idx}`;
      params.push(`%${category}%`);
      idx++;
    }
    if (region) {
      sql += ` AND region ILIKE $${idx}`;
      params.push(`%${region}%`);
      idx++;
    }
    sql += " ORDER BY sale_date DESC LIMIT 1000";
    const result = await pool.query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
});

router.get("/trends", [query("startDate").optional().isISO8601(), query("endDate").optional().isISO8601(), query("groupBy").optional().isIn(["daily", "weekly", "monthly"])], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { startDate, endDate, groupBy = "daily" } = req.query;
    let dateTrunc = "day";
    if (groupBy === "weekly") dateTrunc = "week";
    else if (groupBy === "monthly") dateTrunc = "month";

    let sql = `SELECT DATE_TRUNC('${dateTrunc}', sale_date) AS period, SUM(revenue) AS revenue, SUM(quantity) AS quantity FROM sales WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (startDate) {
      sql += ` AND sale_date >= $${idx}`;
      params.push(startDate);
      idx++;
    }
    if (endDate) {
      sql += ` AND sale_date <= $${idx}`;
      params.push(endDate);
      idx++;
    }
    sql += ` GROUP BY DATE_TRUNC('${dateTrunc}', sale_date) ORDER BY period ASC`;
    const result = await pool.query(sql, params);
    const data = result.rows.map((r) => ({
      period: r.period,
      revenue: parseFloat(r.revenue) || 0,
      quantity: parseInt(r.quantity, 10) || 0,
    }));
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
});

module.exports = router;
