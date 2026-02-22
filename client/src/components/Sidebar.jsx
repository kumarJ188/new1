import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRightOutlined,
  HomeOutlined,
  Groups2Outlined,
  AdminPanelSettingsOutlined,
  HowToRegOutlined,
} from "@mui/icons-material";

import FlexBetween from "./FlexBetween";

const Sidebar = ({ user, drawerWidth, isSidebarOpen, setIsSidebarOpen, isNonMobile }) => {
  const { pathname } = useLocation();
  const [active, setActive] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    setActive(pathname.split("/")[1] || "dashboard");
  }, [pathname]);

  const navItems = useMemo(() => {
    const items = [
      { text: "Dashboard", path: "/dashboard", icon: <HomeOutlined /> },
      { text: "Communities", path: "/communities", icon: <Groups2Outlined /> },
      { text: "My communities", path: "/my-communities", icon: <HowToRegOutlined /> },
    ];

    if (user?.role === "super_admin") {
      items.push({
        text: "Admin: Community approvals",
        path: "/admin/community-approvals",
        icon: <AdminPanelSettingsOutlined />,
      });
    }

    // community admins and super admins can approve members
    if (user?.role === "community_admin" || user?.role === "super_admin") {
      items.push({
        text: "Admin: Membership approvals",
        path: "/admin/membership-approvals",
        icon: <AdminPanelSettingsOutlined />,
      });
    }

    return items;
  }, [user?.role]);

  return (
    <Box component="nav">
      {isSidebarOpen && (
        <Drawer
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          variant="persistent"
          anchor="left"
          sx={{
            width: drawerWidth,
            "& .MuiDrawer-paper": {
              color: theme.palette.secondary[200],
              backgroundColor: theme.palette.background.alt,
              boxSixing: "border-box",
              borderWidth: isNonMobile ? 0 : "2px",
              width: drawerWidth,
            },
          }}
        >
          <Box width="100%">
            <Box m="1.5rem 2rem 1.25rem 2rem">
              <FlexBetween>
                <Typography variant="h5" fontWeight="bold">
                  Community App
                </Typography>
                {!isNonMobile && (
                  <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <ChevronLeft />
                  </IconButton>
                )}
              </FlexBetween>
            </Box>

            <Divider />

            <List>
              {navItems.map(({ text, icon, path }) => {
                const key = path.split("/")[1] || "dashboard";
                const isActive = active === key || pathname === path;

                return (
                  <ListItem key={text} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        navigate(path);
                        setActive(key);
                      }}
                      sx={{
                        backgroundColor: isActive ? theme.palette.secondary[300] : "transparent",
                        color: isActive ? theme.palette.primary[600] : theme.palette.secondary[100],
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          ml: "1.25rem",
                          color: isActive ? theme.palette.primary[600] : theme.palette.secondary[200],
                        }}
                      >
                        {icon}
                      </ListItemIcon>
                      <ListItemText primary={text} />
                      {isActive && <ChevronRightOutlined sx={{ ml: "auto" }} />}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>

          <Box position="absolute" bottom="1.25rem" width="100%">
            <Divider />
            <Box px={2} pt={1.25}>
              <Typography fontWeight={700} sx={{ color: theme.palette.secondary[100] }}>
                {user?.name || ""}
              </Typography>
              <Typography fontSize="0.85rem" sx={{ color: theme.palette.secondary[200] }}>
                {user?.role || ""}
              </Typography>
            </Box>
          </Box>
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar;
