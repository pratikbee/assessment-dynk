const express = require("express");
const { query, validationResult } = require("express-validator");
const pool = require("../config/db");

const router = express.Router();

router.get("/products-per-category", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT category, COUNT(DISTINCT product_name) AS product_count
         FROM sales GROUP BY category ORDER BY product_count DESC`,
    );
    res.json({
      success: true,
      data: result.rows.map((r) => ({ category: r.category, count: parseInt(r.product_count, 10) })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
});

router.get("/top-reviewed", [query("limit").optional().isInt({ min: 1, max: 100 }).toInt()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const limit = req.query.limit || 10;
    const result = await pool.query(
      `SELECT product_name, SUM(review_count) AS total_reviews, AVG(rating) AS avg_rating
         FROM sales WHERE review_count > 0 OR rating IS NOT NULL
         GROUP BY product_name ORDER BY total_reviews DESC NULLS LAST LIMIT $1`,
      [limit],
    );
    res.json({
      success: true,
      data: result.rows.map((r) => ({
        product_name: r.product_name,
        total_reviews: parseInt(r.total_reviews, 10) || 0,
        avg_rating: r.avg_rating ? parseFloat(parseFloat(r.avg_rating).toFixed(2)) : null,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
});

router.get("/discount-distribution", [query("buckets").optional().isInt({ min: 5, max: 50 }).toInt()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const buckets = req.query.buckets || 10;
    const result = await pool.query(`SELECT discount FROM sales WHERE discount IS NOT NULL AND discount >= 0`);
    const values = result.rows.map((r) => parseFloat(r.discount) || 0).filter((v) => v >= 0);
    const max = Math.max(...values, 1);
    const step = max / buckets;
    const hist = Array(buckets)
      .fill(0)
      .map((_, i) => ({
        range: `${(i * step).toFixed(1)}-${((i + 1) * step).toFixed(1)}%`,
        min: i * step,
        max: (i + 1) * step,
        count: 0,
      }));
    for (const v of values) {
      const i = Math.min(Math.floor(v / step), buckets - 1);
      hist[i].count++;
    }
    res.json({ success: true, data: hist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
});

router.get("/category-rating", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT category, AVG(rating) AS avg_rating, COUNT(*) AS count
         FROM sales WHERE rating IS NOT NULL GROUP BY category ORDER BY avg_rating DESC`,
    );
    res.json({
      success: true,
      data: result.rows.map((r) => ({
        category: r.category,
        avg_rating: parseFloat(parseFloat(r.avg_rating).toFixed(2)),
        count: parseInt(r.count, 10),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
});

router.get("/dashboard", [query("category").optional().isString(), query("productSearch").optional().isString(), query("minRating").optional().isFloat({ min: 0, max: 5 }).toFloat()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { category, productSearch, minRating } = req.query;

    const productsPerCategory = await pool.query(`SELECT category, COUNT(DISTINCT product_name) AS product_count FROM sales GROUP BY category ORDER BY product_count DESC`);

    let topReviewedSql = `SELECT product_name, SUM(review_count) AS total_reviews, AVG(rating) AS avg_rating FROM sales WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (category) {
      topReviewedSql += ` AND category ILIKE $${idx}`;
      params.push(`%${category}%`);
      idx++;
    }
    if (productSearch) {
      topReviewedSql += ` AND product_name ILIKE $${idx}`;
      params.push(`%${productSearch}%`);
      idx++;
    }
    if (minRating != null && minRating !== "") {
      topReviewedSql += ` AND rating >= $${idx}`;
      params.push(minRating);
      idx++;
    }
    topReviewedSql += ` GROUP BY product_name ORDER BY total_reviews DESC NULLS LAST LIMIT 10`;
    const topReviewed = await pool.query(topReviewedSql, params);

    const discountRows = await pool.query(`SELECT discount FROM sales WHERE discount IS NOT NULL AND discount >= 0`);
    const discountValues = discountRows.rows.map((r) => parseFloat(r.discount) || 0);
    const buckets = 10;
    const maxD = Math.max(...discountValues, 1);
    const stepD = maxD / buckets;
    const discountDist = Array(buckets)
      .fill(0)
      .map((_, i) => ({
        range: `${(i * stepD).toFixed(1)}-${((i + 1) * stepD).toFixed(1)}%`,
        count: 0,
      }));
    for (const v of discountValues) {
      const i = Math.min(Math.floor(v / stepD), buckets - 1);
      discountDist[i].count++;
    }

    let categoryRatingSql = `SELECT category, AVG(rating) AS avg_rating FROM sales WHERE rating IS NOT NULL`;
    const params2 = [];
    if (category) {
      categoryRatingSql += ` AND category ILIKE $1`;
      params2.push(`%${category}%`);
    }
    categoryRatingSql += ` GROUP BY category ORDER BY avg_rating DESC`;
    const categoryRating = await pool.query(categoryRatingSql, params2);

    res.json({
      success: true,
      data: {
        productsPerCategory: productsPerCategory.rows.map((r) => ({
          category: r.category,
          count: parseInt(r.product_count, 10),
        })),
        topReviewed: topReviewed.rows.map((r) => ({
          product_name: r.product_name,
          total_reviews: parseInt(r.total_reviews, 10) || 0,
          avg_rating: r.avg_rating ? parseFloat(parseFloat(r.avg_rating).toFixed(2)) : null,
        })),
        discountDistribution: discountDist,
        categoryRating: categoryRating.rows.map((r) => ({
          category: r.category,
          avg_rating: parseFloat(parseFloat(r.avg_rating).toFixed(2)),
        })),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
});

module.exports = router;
