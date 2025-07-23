import { useContext } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthContext, AuthProvider } from "./context/AuthContext"
import { SocketProvider } from "./context/SocketContext"
import CustomThemeProvider from "./context/ThemeContext"
import Auth from "./pages/Auth"
import Dashboard from "./pages/Dashboard"
import AdminDashboard from "./pages/AdminDashboard"
import Header from "./components/Header"
import LandingPage from "./pages/LandingPage" // 1. Import the new landing page
import { CircularProgress, Box, CssBaseline } from "@mui/material"

// Import Inter font
import "@fontsource/inter/300.css"
import "@fontsource/inter/400.css"
import "@fontsource/inter/500.css"
import "@fontsource/inter/600.css"
import "@fontsource/inter/700.css"

const AppContent = () => {
  const { user, loading } = useContext(AuthContext)

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    )
  }

  return (
    <Router>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* The Header is correctly shown only for logged-in users */}
        {user && <Header />}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            width: "100%",
            overflow: "hidden",
          }}
        >
          {/* 2. Updated routing logic */}
          <Routes>
            <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" />} />
            <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
            <Route
              path="/admin"
              element={user && user.role === "admin" ? <AdminDashboard /> : <Navigate to="/dashboard" />}
            />
          </Routes>
        </Box>
      </Box>
    </Router>
  )
}

const App = () => {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </CustomThemeProvider>
  )
}

export default App