import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDashboard } from "../api/client";

export const fetchDashboard = createAsyncThunk("dashboard/fetchDashboard", async (params, { rejectWithValue }) => {
  try {
    const p = {};
    if (params?.category) p.category = params.category;
    if (params?.productSearch) p.productSearch = params.productSearch;
    if (params?.minRating != null && params.minRating !== "") p.minRating = params.minRating;
    return await getDashboard(p);
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    data: null,
    loading: false,
    error: null,
    filters: { category: "", productSearch: "", minRating: "" },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.data = action.payload?.data ?? null;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load dashboard";
      });
  },
});

export const { setFilters, clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
