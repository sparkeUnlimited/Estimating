"use client";

import * as React from "react";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Logo from "@/components/Logo";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Image from "next/image";
import MenuIcon from "@mui/icons-material/Menu";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import HomeIcon from "@mui/icons-material/Home";
/* import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import CampaignIcon from "@mui/icons-material/Campaign";
import InfoIcon from "@mui/icons-material/Info";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import ContactSupportIcon from "@mui/icons-material/ContactSupport"; */
import { useRouter, usePathname } from "next/navigation";
import WorkIcon from "@mui/icons-material/Work";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SafetyCheckIcon from "@mui/icons-material/HealthAndSafety";
import BuildIcon from "@mui/icons-material/Build";
import DashboardIcon from "@mui/icons-material/Dashboard";
import NotesIcon from "@mui/icons-material/StickyNote2";

const basePages = [
  "Estimate",
  "Journal",
  "Tasks",
  "Look Ahead",
  "Safety",
  "Tools",
  "Dashboard",
] as const;
const pageIcons = {
  Home: <HomeIcon fontSize="large" />,
  Estimate: <DashboardIcon fontSize="large" />,
  Journal: <NotesIcon fontSize="large" />,
  Tasks: <AssignmentIcon fontSize="large" />,
  "Look Ahead": <WorkIcon fontSize="large" />,
  Safety: <SafetyCheckIcon fontSize="large" />,
  Tools: <BuildIcon fontSize="large" />,
  Dashboard: <DashboardIcon fontSize="large" />,
};

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const isEstimate = pathname === "/" || pathname === "/estimate";

  const pmDomain = "https://pm.sparkeunlimited.ca";

  const pages = [...basePages] as string[];

  const pageRoutes = {
    Home: "/",
    Estimate: "/estimate",
    Journal: "/journal",
    Tasks: "/tasks",
    "Look Ahead": "/lookahead",
    Safety: "/safety",
    Tools: "/tools",
    Dashboard: "/dashboard",
  };

  const [anchorElNav, setAnchorElNav] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar sx={{ backgroundColor: "inherit" }} position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "flex", md: "none" },
              justifyContent: "space-between",
            }}
          >
            <Image
              src="/assets/img/Sparke_Full_Logo.png"
              alt="logo"
              width={100}
              height={100}
              style={{ objectFit: "contain" }}
            />
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {pages.map((page) => (
                <MenuItem
                  sx={{
                    background:
                      page === "Contact Us"
                        ? "linear-gradient(to right, #f59e0b, #ea580c, #fbbf24)"
                        : "inherit",
                    borderRadius: "9999px",
                    border: page === "Contact Us" ? "2px solid transparent" : "none",
                    position: "relative",
                    overflow: "hidden",
                    pointerEvents:
                      page === "Promotions" || (page === "Estimate" && isEstimate)
                        ? "none"
                        : "auto",
                    opacity: page === "Promotions" || (page === "Estimate" && isEstimate) ? 0.5 : 1,
                  }}
                  key={page}
                onClick={() => {
                    if (page === "Estimate") {
                      if (isEstimate) return;
                      handleCloseNavMenu();
                      router.push(pageRoutes[page]);
                    } else {
                      handleCloseNavMenu();
                      window.location.href = `${pmDomain}${pageRoutes[page]}`;
                    }
                  }}
                >
                  {pageIcons[page]}
                  <Typography sx={{ textAlign: "center", marginLeft: 1 }}>{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              justifyContent: "space-between",
            }}
          >
            <Button onClick={() => {
              window.location.href = `${pmDomain}`;
            }}>
              <Image
                src="/assets/img/Sparke_Full_Logo.png"
                alt="logo"
                width={100}
                height={100}
                style={{ objectFit: "contain" }}
              />
            </Button>

            {pages.map((page) => (
              <Button
                key={page}
                onClick={() => {
                  if (page === "Estimate") {
                    if (isEstimate) return;
                    router.push(pageRoutes[page]);
                  } else {
                    window.location.href = `${pmDomain}${pageRoutes[page]}`;
                  }
                }}
                sx={{
                  my: 3,
                  color: page === "Contact Us" ? "black" : "white",
                  fontWeight: 800,
                  display: "flex",
                  pointerEvents:
                    page === "Promotions" || (page === "Estimate" && isEstimate) ? "none" : "auto",
                  background:
                    page === "Contact Us"
                      ? "linear-gradient(to right, #f59e0b, #ea580c, #fbbf24)"
                      : "inherit",
                  borderRadius: "9999px",
                  border: page === "Contact Us" ? "2px solid transparent" : "none",
                  position: "relative",
                  overflow: "hidden",
                  padding: "2px 6px",
                  opacity: page === "Promotions" || (page === "Estimate" && isEstimate) ? 0.5 : 1,
                }}
                startIcon={pageIcons[page]}
              >
                {page}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
