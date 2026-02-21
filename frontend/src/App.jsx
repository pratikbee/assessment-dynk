import React from "react";
import { Box } from "@mui/material";
import AppBar from "./components/AppBar";
import UploadView from "./components/UploadView";
import DashboardView from "./components/DashboardView";
import SalesView from "./components/SalesView";

function App() {
  const [tab, setTab] = React.useState(0);
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar tab={tab} setTab={setTab} />
      <Box sx={{ p: 2 }}>
        {tab === 0 && <DashboardView />}
        {tab === 1 && <UploadView />}
        {tab === 2 && <SalesView />}
      </Box>
    </Box>
  );
}

export default App;
