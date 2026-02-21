require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { initDb } = require("./config/initDb");
const uploadRouter = require("./routes/upload");
const salesRouter = require("./routes/sales");
const analyticsRouter = require("./routes/analytics");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  const log = () => {
    console.log(`[api] ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  };
  res.on("finish", log);
  next();
});

app.use("/api/upload", uploadRouter);
app.use("/api/sales", salesRouter);
app.use("/api/analytics", analyticsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || "Internal server error" });
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database init failed:", err);
    process.exit(1);
  });
