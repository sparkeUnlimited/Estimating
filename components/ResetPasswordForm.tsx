"use client";
import { useState } from "react";
import { TextField, Button, Box, Alert } from "@mui/material";

const ResetPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setMessage(null);
    const resp = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (resp.ok) {
      setMessage("Password updated");
    } else {
      const data = await resp.json();
      setMessage(data.message || "Error");
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto" }}>
      {message && <Alert severity="info">{message}</Alert>}
      <TextField
        label="Email"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="New Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button fullWidth variant="contained" onClick={handleSubmit} sx={{ mt: 2 }}>
        Reset Password
      </Button>
    </Box>
  );
};

export default ResetPasswordForm;
