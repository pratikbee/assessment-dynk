import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getSalesSummary, getSalesFilter, getSalesTrends } from "../api/client";

export const fetchSalesSummary = createAsyncThunk("sales/fetchSummary", async (params, { rejectWithValue }) => {
  try {
    return await getSalesSummary(params);
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const fetchSalesFilter = createAsyncThunk("sales/fetchFilter", async (params, { rejectWithValue }) => {
  try {
    return await getSalesFilter(params);
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const fetchSalesTrends = createAsyncThunk("sales/fetchTrends", async (params, { rejectWithValue }) => {
  try {
    return await getSalesTrends(params);
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

const salesSlice = createSlice({
  name: "sales",
  initialState: {
    summary: null,
    filterResults: null,
    trends: null,
    loading: { summary: false, filter: false, trends: false },
    error: null,
  },
  reducers: {
    clearSalesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalesSummary.pending, (state) => {
        state.loading.summary = true;
        state.error = null;
      })
      .addCase(fetchSalesSummary.fulfilled, (state, action) => {
        state.loading.summary = false;
        state.summary = action.payload?.data ?? null;
      })
      .addCase(fetchSalesSummary.rejected, (state, action) => {
        state.loading.summary = false;
        state.error = action.payload;
      })
      .addCase(fetchSalesFilter.pending, (state) => {
        state.loading.filter = true;
        state.error = null;
      })
      .addCase(fetchSalesFilter.fulfilled, (state, action) => {
        state.loading.filter = false;
        state.filterResults = action.payload?.data ?? null;
      })
      .addCase(fetchSalesFilter.rejected, (state, action) => {
        state.loading.filter = false;
        state.error = action.payload;
      })
      .addCase(fetchSalesTrends.pending, (state) => {
        state.loading.trends = true;
        state.error = null;
      })
      .addCase(fetchSalesTrends.fulfilled, (state, action) => {
        state.loading.trends = false;
        state.trends = action.payload?.data ?? null;
      })
      .addCase(fetchSalesTrends.rejected, (state, action) => {
        state.loading.trends = false;
        state.error = action.payload;
      });
  },
});

export const { clearSalesError } = salesSlice.actions;
export default salesSlice.reducer;
