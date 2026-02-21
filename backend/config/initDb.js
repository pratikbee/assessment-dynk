const pool = require("./db");

const initSchema = `
CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  sale_date DATE NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  region TEXT NOT NULL,
  revenue DECIMAL(15, 2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  discount DECIMAL(5, 2) NOT NULL DEFAULT 0,
  rating DECIMAL(3, 2),
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_product ON sales(product_name);
CREATE INDEX IF NOT EXISTS idx_sales_category ON sales(category);
CREATE INDEX IF NOT EXISTS idx_sales_region ON sales(region);
`;

const alterSchema = `
ALTER TABLE sales ALTER COLUMN product_name TYPE TEXT;
ALTER TABLE sales ALTER COLUMN category TYPE TEXT;
ALTER TABLE sales ALTER COLUMN region TYPE TEXT;
`;

async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(initSchema);
    try {
      await client.query(alterSchema);
    } catch (_) {}
    console.log(`Connected to PostgreSQL (${process.env.DB_HOST || "localhost"}/${process.env.DB_NAME || "assessment_db"})`);
  } finally {
    client.release();
  }
}

module.exports = { initDb };
