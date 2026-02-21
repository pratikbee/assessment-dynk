import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Paper, Typography, Button, Alert, CircularProgress } from "@mui/material";
import { useDropzone } from "react-dropzone";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { uploadSalesFile, clearUploadState } from "../store/uploadSlice";

export default function UploadView() {
  const dispatch = useDispatch();
  const { loading, error, lastResult } = useSelector((s) => s.upload);

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      dispatch(clearUploadState());
      dispatch(uploadSalesFile(acceptedFiles[0]));
    },
    [dispatch],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxFiles: 1,
    disabled: loading,
  });

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Import Sales Data
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Upload a CSV or Excel file with columns such as: date, product_name, category, region, revenue, quantity, discount, rating, review_count
      </Typography>
      {error && (
        <Alert severity="error" onClose={() => dispatch(clearUploadState())} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {lastResult && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Imported {lastResult.count} record(s) successfully.
        </Alert>
      )}
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          textAlign: "center",
          cursor: loading ? "wait" : "pointer",
          border: "2px dashed",
          borderColor: isDragActive ? "primary.main" : "divider",
          bgcolor: isDragActive ? "action.hover" : "background.paper",
        }}
      >
        <input {...getInputProps()} />
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <CloudUploadIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
            <Typography>{isDragActive ? "Drop the file here" : "Drag & drop a CSV or Excel file here, or click to select"}</Typography>
            <Button variant="contained" sx={{ mt: 2 }} disabled={loading}>
              Select File
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
}
