import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Paper, Typography, Grid, TextField, Button, Alert, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fetchSalesSummary, fetchSalesFilter, fetchSalesTrends } from "../store/salesSlice";

export default function SalesView() {
  const dispatch = useDispatch();
  const { summary, filterResults, trends, loading, error } = useSelector((s) => s.sales);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [product, setProduct] = useState("");
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState("");
  const [groupBy, setGroupBy] = useState("daily");

  useEffect(() => {
    dispatch(fetchSalesSummary({}));
    dispatch(fetchSalesFilter({}));
    dispatch(fetchSalesTrends({ groupBy: "monthly" }));
  }, []);

  const loadSummary = () => {
    const p = {};
    if (startDate) p.startDate = startDate;
    if (endDate) p.endDate = endDate;
    dispatch(fetchSalesSummary(p));
  };

  const loadFilter = () => {
    const p = {};
    if (startDate) p.startDate = startDate;
    if (endDate) p.endDate = endDate;
    if (product) p.product = product;
    if (category) p.category = category;
    if (region) p.region = region;
    dispatch(fetchSalesFilter(p));
  };

  const loadTrends = () => {
    const p = { groupBy };
    if (startDate) p.startDate = startDate;
    if (endDate) p.endDate = endDate;
    dispatch(fetchSalesTrends(p));
  };

  const trendData = (trends || []).map((t) => ({
    ...t,
    period: t.period ? new Date(t.period).toLocaleDateString() : "",
  }));

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Sales Data
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Revenue
            </Typography>
            {loading.summary ? <CircularProgress size={24} /> : <Typography variant="h6">{summary?.totalRevenue != null ? `$${Number(summary.totalRevenue).toLocaleString()}` : "-"}</Typography>}
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Quantity
            </Typography>
            {loading.summary ? <CircularProgress size={24} /> : <Typography variant="h6">{summary?.totalQuantity != null ? summary.totalQuantity.toLocaleString() : "-"}</Typography>}
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Sales (rows)
            </Typography>
            {loading.summary ? <CircularProgress size={24} /> : <Typography variant="h6">{summary?.totalSales != null ? summary.totalSales : "-"}</Typography>}
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <TextField size="small" type="date" label="Start" value={startDate} onChange={(e) => setStartDate(e.target.value)} fullWidth sx={{ mb: 1 }} />
            <TextField size="small" type="date" label="End" value={endDate} onChange={(e) => setEndDate(e.target.value)} fullWidth />
            <Button fullWidth variant="outlined" onClick={loadSummary} sx={{ mt: 1 }} disabled={loading.summary}>
              Refresh Summary
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sales Trend
            </Typography>
            <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
              <TextField size="small" select SelectProps={{ native: true }} label="Group by" value={groupBy} onChange={(e) => setGroupBy(e.target.value)} sx={{ minWidth: 120 }}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </TextField>
              <Button variant="contained" onClick={loadTrends} disabled={loading.trends}>
                Load Trends
              </Button>
            </Box>
            {loading.trends ? (
              <CircularProgress />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#1976d2" name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Filter Sales
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6} sm={2}>
                <TextField size="small" fullWidth label="Product" value={product} onChange={(e) => setProduct(e.target.value)} />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField size="small" fullWidth label="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField size="small" fullWidth label="Region" value={region} onChange={(e) => setRegion(e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button variant="contained" onClick={loadFilter} disabled={loading.filter}>
                  Apply Filter
                </Button>
              </Grid>
            </Grid>
            {loading.filter ? (
              <CircularProgress />
            ) : (
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Product</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Region</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Discount %</TableCell>
                      <TableCell align="right">Rating</TableCell>
                      <TableCell align="right">Reviews</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(filterResults || []).map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{row.sale_date ? new Date(row.sale_date).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>{row.product_name}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell>{row.region}</TableCell>
                        <TableCell align="right">{row.revenue != null ? Number(row.revenue).toFixed(2) : "-"}</TableCell>
                        <TableCell align="right">{row.quantity ?? "-"}</TableCell>
                        <TableCell align="right">{row.discount != null ? Number(row.discount).toFixed(1) : "-"}</TableCell>
                        <TableCell align="right">{row.rating != null ? Number(row.rating).toFixed(1) : "-"}</TableCell>
                        <TableCell align="right">{row.review_count ?? "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {!loading.filter && (!filterResults || filterResults.length === 0) && <Typography color="text.secondary">No records. Upload data or adjust filters.</Typography>}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
