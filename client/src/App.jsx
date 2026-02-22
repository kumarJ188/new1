import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme";
import { useSelector } from "react-redux";
import { useMemo } from "react";

import Layout from "@scenes/layout";
import Dashboard from "@scenes/dashboard";
import Login from "@scenes/auth/Login";
import Register from "@scenes/auth/Register";
import Communities from "@scenes/communities/Communities";
import CommunityDetail from "@scenes/communities/CommunityDetail";
import MyCommunities from "@scenes/communities/MyCommunities";
import CommunityApprovals from "@scenes/admin/CommunityApprovals";
import MembershipApprovals from "@scenes/admin/MembershipApprovals";

import "./App.css";

function App() {
  const mode = useSelector((state) => state.global.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/communities" element={<Communities />} />
              <Route path="/communities/:id" element={<CommunityDetail />} />
              <Route path="/my-communities" element={<MyCommunities />} />
              <Route path="/admin/community-approvals" element={<CommunityApprovals />} />
              <Route path="/admin/membership-approvals" element={<MembershipApprovals />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
