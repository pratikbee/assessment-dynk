import { configureStore } from "@reduxjs/toolkit";
import uploadReducer from "./uploadSlice";
import dashboardReducer from "./dashboardSlice";
import salesReducer from "./salesSlice";

export default configureStore({
  reducer: {
    upload: uploadReducer,
    dashboard: dashboardReducer,
    sales: salesReducer,
  },
});
