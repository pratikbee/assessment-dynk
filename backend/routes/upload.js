const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const { parse } = require("csv-parse/sync");
const pool = require("../config/db");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(csv|xlsx|xls)$/i)) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV and Excel files are allowed"));
    }
  },
});

function normalizeRow(row) {
  const keys = Object.keys(row).map((k) => k.toLowerCase().replace(/\s+/g, "_"));
  const values = Object.values(row);
  const obj = {};
  keys.forEach((k, i) => {
    obj[k] = values[i];
  });
  return obj;
}

function parseNumber(v) {
  if (v === null || v === undefined || v === "") return 0;
  const n = parseFloat(String(v).replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? 0 : n;
}

function parseDate(v) {
  if (!v) return null;
  if (v instanceof Date) return v;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function extractSalesFromRows(rows) {
  const sales = [];
  const dateKeys = ["date", "sale_date", "saledate", "order_date"];
  const productKeys = ["product_name", "product", "productname", "item"];
  const categoryKeys = ["category", "categories"];
  const regionKeys = ["region", "regions", "location"];
  const revenueKeys = ["revenue", "sales", "amount", "total", "discounted_price", "actual_price"];
  const quantityKeys = ["quantity", "qty", "units"];
  const discountKeys = ["discount", "discount_percent", "discount%", "discount_percentage"];
  const ratingKeys = ["rating", "ratings", "avg_rating"];
  const reviewKeys = ["review_count", "reviews", "num_reviews", "rating_count"];

  for (const row of rows) {
    const r = normalizeRow(row);
    const getFirst = (keyList) => {
      for (const k of keyList) {
        if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== "") return r[k];
      }
      return null;
    };
    const dateVal = parseDate(getFirst(dateKeys)) || new Date();
    const productName = String(getFirst(productKeys) || "Unknown").trim();
    let category = String(getFirst(categoryKeys) || "Uncategorized").trim();
    if (category.includes("|")) {
      category = category.split("|")[0].trim() || category;
    }
    const region = String(getFirst(regionKeys) || "Unknown").trim();
    let revenue = parseNumber(getFirst(revenueKeys));
    if (revenue === 0) {
      const actual = parseNumber(r.actual_price);
      if (actual > 0) revenue = actual;
    }
    const quantity = parseNumber(getFirst(quantityKeys)) || 1;
    let discount = parseNumber(getFirst(discountKeys));
    if (discount > 0 && discount <= 1) discount = Math.round(discount * 100);
    const rating = parseNumber(getFirst(ratingKeys));
    const reviewCount = Math.max(0, Math.floor(parseNumber(getFirst(reviewKeys))));

    sales.push({
      sale_date: dateVal,
      product_name: productName,
      category,
      region,
      revenue,
      quantity,
      discount,
      rating: rating || null,
      review_count: reviewCount,
    });
  }
  return sales;
}

router.post("/", upload.single("file"), async (req, res) => {
  const start = Date.now();
  const t = (label) => console.log(`[upload] ${label} +${Date.now() - start}ms`);
  console.log("[upload] 1.request", req.file ? { name: req.file.originalname, size: req.file.size } : "no file");
  try {
    if (!req.file) {
      const body = { success: false, message: "No file uploaded" };
      t("1.response 400 no file");
      return res.status(400).json(body);
    }
    const file = req.file;
    let rows = [];
    const parseStart = Date.now();

    if (file.originalname.toLowerCase().endsWith(".csv")) {
      const content = file.buffer.toString("utf8");
      rows = parse(content, { columns: true, skip_empty_lines: true, trim: true });
      t(`2.parse csv done rows=${rows.length} ${Date.now() - parseStart}ms`);
    } else {
      const workbook = XLSX.read(file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json(sheet);
      t(`2.parse xlsx done rows=${rows.length} ${Date.now() - parseStart}ms`);
    }

    if (!rows || rows.length === 0) {
      t("2.response 400 no rows");
      return res.status(400).json({ success: false, message: "No data found in file" });
    }

    const extractStart = Date.now();
    const sales = extractSalesFromRows(rows);
    t(`3.extract sales done count=${sales.length} ${Date.now() - extractStart}ms`);

    if (sales.length === 0) {
      t("3.response 400 no sales");
      return res.status(400).json({ success: false, message: "No valid sales rows extracted" });
    }

    t("4.db connect start");
    const client = await pool.connect();
    t("4.db connected");
    try {
      const BATCH = 100;
      const insertStart = Date.now();
      for (let i = 0; i < sales.length; i += BATCH) {
        const batch = sales.slice(i, i + BATCH);
        const values = batch.flatMap((s) => [s.sale_date, s.product_name, s.category, s.region, s.revenue, s.quantity, s.discount, s.rating ?? null, s.review_count]);
        const placeholders = batch.map((_, b) => `(${Array.from({ length: 9 }, (_, j) => `$${b * 9 + j + 1}`).join(",")})`).join(",");
        await client.query(`INSERT INTO sales (sale_date, product_name, category, region, revenue, quantity, discount, rating, review_count) VALUES ${placeholders}`, values);
        const done = Math.min(i + BATCH, sales.length);
        if (done % 500 === 0 || done === sales.length) {
          t(`5.insert ${done}/${sales.length} ${Date.now() - insertStart}ms`);
        }
      }
      const inserted = sales.length;
      const body = { success: true, message: "Data imported successfully", count: inserted };
      t(`6.response 201 count=${inserted} total=${Date.now() - start}ms`);
      res.status(201).json(body);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[upload] error", err.message);
    t(`error response 500 ${Date.now() - start}ms`);
    res.status(500).json({ success: false, message: err.message || "Import failed" });
  }
});

module.exports = router;
