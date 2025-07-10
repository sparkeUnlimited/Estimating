"use client";

import Layout from "@/layout/Layout";
import termsData from "@/data/TermsAndConditions.json";
import { Typography, Box } from "@mui/material";

export default function TermsAndConditionsPage() {
  return (
    <Layout title="Terms & Conditions">
      <Typography variant="h4" gutterBottom>
        {termsData.title}
      </Typography>
      {termsData.sections.map((section, idx) => (
        <Box key={idx} sx={{ mt: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            {section.title}
          </Typography>
          <Typography sx={{ mt: 1, whiteSpace: "pre-line" }}>
            {section.text}
          </Typography>
        </Box>
      ))}
    </Layout>
  );
}
