import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Paper, Typography, Grid, TextField, MenuItem, Alert, CircularProgress, InputAdornment } from "@mui/material";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { fetchDashboard, setFilters } from "../store/dashboardSlice";

const COLORS = ["#1976d2", "#9c27b0", "#2e7d32", "#ed6c02", "#d32f2f", "#0288d1", "#7b1fa2", "#388e3c"];

export default function DashboardView() {
  const dispatch = useDispatch();
  const { data, loading, error, filters } = useSelector((s) => s.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard(filters));
  }, []);

  const applyFilters = () => {
    dispatch(fetchDashboard(filters));
  };

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  if (loading && !data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Analytics Dashboard
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Product Name"
              placeholder="Search product..."
              value={filters.productSearch}
              onChange={(e) => handleFilterChange("productSearch", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="text.secondary">
                      Enter to apply
                    </Typography>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField fullWidth size="small" select label="Category" value={filters.category} onChange={(e) => handleFilterChange("category", e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {data?.productsPerCategory?.map((r) => (
                <MenuItem key={r.category} value={r.category}>
                  {r.category}
                </MenuItem>
              )) || []}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField fullWidth size="small" select label="Min Rating (Review)" value={filters.minRating} onChange={(e) => handleFilterChange("minRating", e.target.value)}>
              <MenuItem value="">Any</MenuItem>
              {[1, 2, 3, 4, 5].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}+
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Typography
              component="button"
              onClick={applyFilters}
              sx={{
                cursor: "pointer",
                color: "primary.main",
                textDecoration: "underline",
                border: "none",
                background: "none",
                fontSize: "1rem",
              }}
            >
              Apply
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {data && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Products per Category (Line)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.productsPerCategory || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#1976d2" name="Products" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Top Reviewed Products
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.topReviewed || []} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="product_name" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_reviews" fill="#9c27b0" name="Reviews" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Discount Distribution (Histogram)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.discountDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="Count" fill="#2e7d32">
                    {(data.discountDistribution || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Category-wise Average Rating
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.categoryRating || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="avg_rating" name="Avg Rating" fill="#ed6c02" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {!data && !loading && <Typography color="text.secondary">Upload data first to see analytics.</Typography>}
    </Box>
  );
}
