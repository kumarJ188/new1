import { Box, Button, Paper, TextField, Typography, Alert } from "@mui/material";
import { useState } from "react";
import { api, useLoginMutation } from "@state/api";
import { useDispatch } from "react-redux";
import { setAuth } from "@state";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // Clear cached queries from any previous session/user
      dispatch(api.util.resetApiState());
      const res = await login({ email, password }).unwrap();
      dispatch(setAuth({ token: res.token, user: res.user }));
      navigate("/dashboard");
    } catch (err) {
      setError(err?.data?.message || "Login failed");
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
        Unified Community App
      </Typography>

      <Typography
        variant="body2"
        mb={3}
        color="text.secondary"
        textAlign="center"
      >
        Sign in to continue.
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
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>

        <Typography variant="body2" textAlign="center">
          New here?{" "}
          <Link
            to="/register"
            style={{ textDecoration: "none", fontWeight: 600 }}
          >
            Create an account
          </Link>
        </Typography>
      </Box>
    </Paper>
  </Box>
);
}
