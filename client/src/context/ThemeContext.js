"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { CssBaseline } from "@mui/material"

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

const CustomThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode")
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode))
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
      primary: {
        main: isDarkMode ? "#8ab4f8" : "#1a73e8",
        light: isDarkMode ? "#aecbfa" : "#4285f4",
        dark: isDarkMode ? "#669df6" : "#1557b0",
      },
      secondary: {
        main: isDarkMode ? "#81c995" : "#34a853",
        light: isDarkMode ? "#a8dab5" : "#5bb974",
        dark: isDarkMode ? "#5bb974" : "#2d7d32",
      },
      background: {
        default: isDarkMode ? "#0d1117" : "#ffffff",
        paper: isDarkMode ? "#161b22" : "#ffffff",
        surface: isDarkMode ? "#21262d" : "#f8f9fa",
      },
      text: {
        primary: isDarkMode ? "#f0f6fc" : "#202124",
        secondary: isDarkMode ? "#8b949e" : "#5f6368",
      },
      divider: isDarkMode ? "#30363d" : "#e8eaed",
      action: {
        hover: isDarkMode ? "rgba(177, 186, 196, 0.08)" : "rgba(60, 64, 67, 0.08)",
        selected: isDarkMode ? "rgba(177, 186, 196, 0.12)" : "rgba(60, 64, 67, 0.12)",
      },
    },
    typography: {
      fontFamily: '"Inter", "Google Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: {
        fontSize: "2.125rem",
        fontWeight: 400,
        lineHeight: 1.235,
      },
      h2: {
        fontSize: "1.5rem",
        fontWeight: 400,
        lineHeight: 1.334,
      },
      h3: {
        fontSize: "1.25rem",
        fontWeight: 500,
        lineHeight: 1.6,
      },
      h4: {
        fontSize: "1.125rem",
        fontWeight: 500,
        lineHeight: 1.5,
      },
      h5: {
        fontSize: "1rem",
        fontWeight: 500,
        lineHeight: 1.5,
      },
      h6: {
        fontSize: "0.875rem",
        fontWeight: 500,
        lineHeight: 1.57,
      },
      body1: {
        fontSize: "0.875rem",
        lineHeight: 1.43,
      },
      body2: {
        fontSize: "0.75rem",
        lineHeight: 1.33,
      },
      button: {
        textTransform: "none",
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            padding: "8px 16px",
            fontWeight: 500,
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
            },
          },
          contained: {
            "&:hover": {
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: isDarkMode ? "1px solid #30363d" : "1px solid #e8eaed",
            boxShadow: isDarkMode
              ? "0 1px 3px rgba(0,0,0,0.3)"
              : "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: isDarkMode ? "1px solid #30363d" : "1px solid #e8eaed",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            fontWeight: 500,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
            },
          },
        },
      },
    },
  })

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}

export default CustomThemeProvider