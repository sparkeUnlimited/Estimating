"use client";
import { useState } from "react";
import { TextField, Button, Box, Alert } from "@mui/material";
import { useRouter } from "next/navigation";

const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setError("");
    const resp = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (resp.ok) {
      setSuccess(true);
    } else {
      const data = await resp.json();
      setError(data.message || "Signup failed");
    }
  };

  if (success) {
    return <Alert severity="success">Account created. Await approval.</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 400, mx: "auto" }}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Email"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button fullWidth variant="contained" onClick={handleSubmit} sx={{ mt: 2 }}>
        Sign Up
      </Button>
    </Box>
  );
};

export default SignUpForm;
