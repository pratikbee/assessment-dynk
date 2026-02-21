import React from "react";
import { AppBar as MuiAppBar, Toolbar, Typography, Tabs, Tab } from "@mui/material";

export default function AppBar({ tab, setTab }) {
  return (
    <MuiAppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Product Ratings & Review Analytics
        </Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="inherit" indicatorColor="secondary">
          <Tab label="Dashboard" />
          <Tab label="Upload Data" />
          <Tab label="Sales" />
        </Tabs>
      </Toolbar>
    </MuiAppBar>
  );
}
