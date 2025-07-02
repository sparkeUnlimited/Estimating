"use client";

import BoltIcon from "@mui/icons-material/Bolt";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

import Layout from "@/layout/Layout";

const Home = () => {
  return (
    <Layout title="Home">
      <Paper sx={{ backgroundColor: "transparent", p: 4, mb: 4 }} elevation={3}>
      <Typography
        variant="h2"
        align="center"
        sx={{
          fontSize: { xs: "3rem", sm: "5rem" }, // Responsive font size
          fontWeight: "extrabold", // Font weight
          lineHeight: 1.15, // Line height
          background: "linear-gradient(to right, #f59e0b, #ea580c, #fbbf24)",
          WebkitBackgroundClip: "text", // Clip background to text
          WebkitTextFillColor: "transparent", // Make text transparent
        }}
        className="head_text"
      >
        Spark-E Project Application
      </Typography>
      <Box
        sx={{
          bgcolor: "#DEDEDE",
          marginTop: 2,
          marginBottom: 2,
          width: 1,
          align: "center",
        }}
      >
        <Typography
          variant={"body1"}
          sx={{
            textAlign: "left",
            paddingTop: 2,
            marginBottom: 1,
            paddingLeft: 2,
            fontWeight: "bold",
          }}
        >
          Instructions:
        </Typography>
        <Typography
          variant={"body1"}
          sx={{ textAlign: "left", marginBottom: 1, paddingLeft: 2, fontWeight: "medium" }}
        >
          Use the links above to document what is needed.
        </Typography>
        <Typography
          variant={"body1"}
          sx={{ textAlign: "left", marginBottom: 1, paddingLeft: 2, fontWeight: "bold" }}
        >
          Estimate
        </Typography>
        <Typography
          variant={"body1"}
          sx={{ textAlign: "left", marginBottom: 1, paddingLeft: 2, fontWeight: "medium" }}
        >
          This is used to estimate jobs. A PDF will be sent to the customer and Ryan.
        </Typography>
        <Typography
          variant={"body1"}
          sx={{ textAlign: "left", marginBottom: 1, paddingLeft: 2, fontWeight: "bold" }}
        >
          Job Site Journal
        </Typography>
        <Typography
          variant={"body1"}
          sx={{ textAlign: "left", marginBottom: 1, paddingLeft: 2, fontWeight: "medium" }}
        >
          This is used by the foreman to document the daily tasks complete.
        </Typography>

        <Typography
          variant={"body1"}
          sx={{ textAlign: "left", marginBottom: 1, paddingLeft: 2, fontWeight: "bold" }}
        >
          Tasks
        </Typography>
        <Typography
          variant={"body1"}
          sx={{ textAlign: "left", marginBottom: 1, paddingLeft: 2, fontWeight: "medium" }}
        >
          These are the daily tasks and the task assignment.
        </Typography>
        <Typography
          variant={"body1"}
          sx={{ textAlign: "left", marginBottom: 1, paddingLeft: 2, fontWeight: "bold" }}
        >
          Look Ahead
        </Typography>
        <Typography
          variant={"body1"}
          sx={{ textAlign: "left", marginBottom: 1, paddingLeft: 2, fontWeight: "medium" }}
        >
          There is a 2 week and 2 month look ahead report that will describe the tasks coming up.
        </Typography>
        <Typography
          variant={"body1"}
          sx={{ textAlign: "left", marginBottom: 1, paddingLeft: 2, fontWeight: "bold" }}
        >
          Safety
        </Typography>
        <Typography
          variant={"body1"}
          sx={{ textAlign: "left", marginBottom: 1, paddingLeft: 2, fontWeight: "medium" }}
        >
          These are the safety inspection reports for tasks, lifts, etc.
        </Typography>
        <Typography
          variant={"body1"}
          sx={{ textAlign: "left", marginBottom: 1, paddingLeft: 2, fontWeight: "bold" }}
        >
          Tools
        </Typography>
        <Typography
          variant={"body1"}
          sx={{ textAlign: "left", marginBottom: 1, paddingLeft: 2, fontWeight: "medium" }}
        >
          This is to request tools or material needed.
        </Typography>
        <Typography
          variant={"body1"}
          sx={{ textAlign: "left", marginBottom: 1, paddingLeft: 2, fontWeight: "bold" }}
        >
          Dashboard
        </Typography>
        <Typography
          variant={"body1"}
          sx={{
            textAlign: "left",
            marginBottom: 1,
            paddingLeft: 2,
            paddingBottom: 2,
            fontWeight: "medium",
          }}
        >
          This is a dashboard for the GC to track progress.
        </Typography>
      </Box>
      </Paper>
    </Layout>
  );
};

export default Home;
