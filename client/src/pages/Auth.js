"use client"

import { useState, useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Link as MuiLink,
  Alert,
  Paper,
  Divider,
  IconButton,
} from "@mui/material"
import { Task as TaskIcon, Visibility, VisibilityOff } from "@mui/icons-material"

const Auth = () => {
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login, register } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isRegister) {
        await register(name, email, password)
      } else {
        await login(email, password)
      }
      navigate("/dashboard")
    } catch (err) {
      setError(err.response?.data?.message || "An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        py: 4,
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "white",
              }}
            >
              <TaskIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 400, mb: 1 }}>
              Welcome to TaskFlow
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center">
              {isRegister ? "Create your account to get started" : "Sign in to your account"}
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            {isRegister && (
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ mb: 2 }}
              />
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
              sx={{ mb: 3 }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                fontSize: "1rem",
                mb: 3,
                boxShadow: "0 2px 8px rgba(26, 115, 232, 0.25)",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(26, 115, 232, 0.35)",
                },
              }}
            >
              {loading
                ? isRegister
                  ? "Creating Account..."
                  : "Signing In..."
                : isRegister
                  ? "Create Account"
                  : "Sign In"}
            </Button>

            <Divider sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
            </Divider>

            <Box sx={{ textAlign: "center" }}>
              <MuiLink
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault()
                  setIsRegister(!isRegister)
                  setError("")
                }}
                sx={{
                  textDecoration: "none",
                  color: "primary.main",
                  fontWeight: 500,
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                {isRegister ? "Already have an account? Sign In" : "Don't have an account? Create one"}
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default Auth