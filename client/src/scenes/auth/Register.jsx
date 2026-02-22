import { Box, Button, Paper, TextField, Typography, Alert } from "@mui/material";
import { useState } from "react";
import { api, useRegisterMutation } from "@state/api";
import { useDispatch } from "react-redux";
import { setAuth } from "@state";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [register, { isLoading }] = useRegisterMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // Clear cached queries from any previous session/user
      dispatch(api.util.resetApiState());
      const res = await register({ name, email, password }).unwrap();
      dispatch(setAuth({ token: res.token, user: res.user }));
      navigate("/dashboard");
    } catch (err) {
      setError(err?.data?.message || "Registration failed");
    }
  };

  return (
  <Box
    sx={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f5f5f5",
      p: 2,
    }}
  >
    <Paper
      elevation={6}
      sx={{
        p: 4,
        width: "100%",
        maxWidth: 420,
        borderRadius: 3,
      }}
    >
      <Typography variant="h4" fontWeight={700} mb={2} textAlign="center">
        Create Account
      </Typography>

      <Typography
        variant="body2"
        mb={3}
        color="text.secondary"
        textAlign="center"
      >
        Sign up to get started.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={onSubmit}
        display="flex"
        flexDirection="column"
        gap={2}
      >
        <TextField
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
        />

        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          fullWidth
          required
        />

        <TextField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          fullWidth
          required
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create Account"}
        </Button>

        <Typography variant="body2" textAlign="center">
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ textDecoration: "none", fontWeight: 600 }}
          >
            Sign in
          </Link>
        </Typography>
      </Box>
    </Paper>
  </Box>
);}
