import { Typography } from "@mui/material";
import termsData from "@/data/TermsAndConditions.json";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

export default function TermsAndConditions() {
  return (
    <Paper sx={{p:4}}>
      <Typography variant="h4" gutterBottom>
        {termsData.title}
      </Typography>
      {termsData.sections.map((section, idx) => (
        <Box key={idx} sx={{ mt: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            {section.title}
          </Typography>
          <Typography sx={{ mt: 1, whiteSpace: "pre-line" }}>{section.text}</Typography>
        </Box>
      ))}
    </Paper>
  );
}
