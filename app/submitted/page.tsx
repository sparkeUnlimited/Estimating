"use client";
import Layout from "@/layout/Layout";
import { Box, Typography, Button, Paper } from "@mui/material";
import { useRouter } from "next/navigation";

export default function SubmittedPage() {
  const router = useRouter();
  return (
    <Layout title="Submission Successful">
      <Paper sx={{ p: 4, textAlign: "center" }} elevation={4}>
        <Typography variant="h4" gutterBottom>
          Submission Successful
        </Typography>
        <Typography sx={{ mb: 2 }}>
          Thank you! Your agreement has been submitted successfully.
        </Typography>
        <Button variant="contained" onClick={() => router.push("/")}>Return Home</Button>
      </Paper>
    </Layout>
  );
}
