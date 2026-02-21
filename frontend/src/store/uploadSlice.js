import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { uploadFile } from "../api/client";

export const uploadSalesFile = createAsyncThunk("upload/uploadSalesFile", async (file, { rejectWithValue }) => {
  try {
    return await uploadFile(file);
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

const uploadSlice = createSlice({
  name: "upload",
  initialState: {
    loading: false,
    error: null,
    lastResult: null,
  },
  reducers: {
    clearUploadState: (state) => {
      state.error = null;
      state.lastResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadSalesFile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.lastResult = null;
      })
      .addCase(uploadSalesFile.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.lastResult = action.payload;
      })
      .addCase(uploadSalesFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Upload failed";
        state.lastResult = null;
      });
  },
});

export const { clearUploadState } = uploadSlice.actions;
export default uploadSlice.reducer;
